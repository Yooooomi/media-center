import * as path from "path";
import * as fs from "fs";
import {
  Project,
  SyntaxKind,
  SourceFile,
  StructureKind,
  ReferencedSymbolEntry,
  Decorator,
  VariableDeclarationKind,
  TypeAliasDeclaration,
} from "ts-morph";

class Freezer {
  readonly project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
  });

  static readonly log = {
    info: (...args: any) => console.log("[\x1b[34mINFO\x1b[0m]:", ...args),
    success: (...args: any) => console.log("[\x1b[32mINFO\x1b[0m]:", ...args),
    noop: (...args: any) => console.log("[\x1b[33mINFO\x1b[0m]:", ...args),
    warn: (...args: any) => console.log("[WARN]:", ...args),
  };

  static bold(str: string) {
    return `\x1b[1m${str}\x1b[0m`;
  }

  static readonly TOKENS = {
    freezeDecoratorName: "Freeze",
    upcastFileSuffix: "upcast",
    versionFilesSuffix: "version",
    upcastVariableNameSuffix: "UpcastManifest",
    versionsTypeName: "Versions",
    serializeMethodName: "serialize",
  };

  static UnexpectedError = class extends Error {};
  static UnnamedClassError = class extends Error {
    constructor() {
      super("Cannot freeze unnamed class");
    }
  };

  constructor(private readonly relativeDirToGenerateFiles = ".") {}

  private getUpcastSourceFile(path: string) {
    if (!fs.existsSync(path)) {
      Freezer.log.info(`Creating upcast source file`);
      return { version: 0, sourceFile: this.project.createSourceFile(path) };
    }
    Freezer.log.info(`Upcast source file existing`);
    const upcastSourceFile = this.project.getSourceFileOrThrow(path);
    const versionsArray = upcastSourceFile
      .getTypeAliasOrThrow(Freezer.TOKENS.versionsTypeName)
      .asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
    const version = versionsArray
      .getTypeNodeOrThrow()
      .asKindOrThrow(SyntaxKind.TupleType)
      .getElements().length;
    return { version, sourceFile: upcastSourceFile };
  }

  private static resolveImportType(sourceFile: SourceFile, name: string) {
    return sourceFile
      .getImportDeclarationOrThrow((e) =>
        e.getNamedImports().some((i) => i.getName() === name)
      )
      .getNamedImports()[0]
      ?.getNameNode()
      .getDefinitions()[0]
      ?.getNode()
      .getParentOrThrow()
      .asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
  }

  private static getPropertiesOfTypeDeclaration(
    declaration: TypeAliasDeclaration
  ) {
    return declaration
      .getChildAtIndex(4)
      .asKindOrThrow(SyntaxKind.TypeLiteral)
      .getProperties()
      .map((e) => e.getText())
      .sort();
  }

  private static propertiesEqual(a: string[], b: string[]) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((aproperty, index) => aproperty === b[index]);
  }

  private addVersionToUpcastSourceFile(
    sourceFile: SourceFile,
    name: string,
    version: number
  ) {
    const upcastVariableName = `${name}${Freezer.TOKENS.upcastVariableNameSuffix}`;
    let versionsArray = sourceFile
      .getTypeAlias(Freezer.TOKENS.versionsTypeName)
      ?.asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
    let upcastRecord = sourceFile
      .getVariableStatement(upcastVariableName)
      ?.asKindOrThrow(SyntaxKind.VariableStatement);
    if (!versionsArray) {
      versionsArray = sourceFile
        .addTypeAlias({
          name: Freezer.TOKENS.versionsTypeName,
          type: "[]",
        })
        .asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
    }
    if (!upcastRecord) {
      upcastRecord = sourceFile
        .addVariableStatement({
          declarations: [{ name: upcastVariableName, initializer: "{}" }],
          isExported: true,
          declarationKind: VariableDeclarationKind.Const,
        })
        .asKindOrThrow(SyntaxKind.VariableStatement);
    }
    const previousTypeName = `${name}${version - 1}`;
    const typeName = `${name}${version}`;
    const importStatement = sourceFile.addImportDeclaration({
      moduleSpecifier: `./${Freezer.normalizeFilename(
        name
      )}.version.${version}`,
      namedImports: [{ name: typeName }],
      isTypeOnly: true,
    });
    const [newVersionImport] = importStatement.getNamedImports();
    if (!newVersionImport) {
      throw new Freezer.UnexpectedError();
    }
    const versions = versionsArray
      .getTypeNodeOrThrow()
      .asKindOrThrow(SyntaxKind.TupleType);

    const lastVersioned = versions
      .getElements()
      [versions.getElements().length - 1]?.asKindOrThrow(
        SyntaxKind.TypeReference
      );
    if (lastVersioned) {
      const newVersionType = Freezer.resolveImportType(
        newVersionImport.getSourceFile(),
        newVersionImport.getName()
      );
      const lastVersionType = Freezer.resolveImportType(
        lastVersioned.getSourceFile(),
        lastVersioned.getTypeName().getText()
      );
      if (!lastVersionType || !newVersionType) {
        throw new Freezer.UnexpectedError();
      }
      const lastVersionProperties =
        Freezer.getPropertiesOfTypeDeclaration(lastVersionType);
      const newVersionProperties =
        Freezer.getPropertiesOfTypeDeclaration(newVersionType);
      if (
        Freezer.propertiesEqual(lastVersionProperties, newVersionProperties)
      ) {
        Freezer.log.noop(
          `Unnecessary freeze for ${Freezer.bold(
            name
          )}, (${lastVersionProperties} is equal to ${newVersionProperties})`
        );
        return false;
      }
    }

    versionsArray.set({
      type: `[${[
        ...versions.getElements().map((e) => e.getText()),
        typeName,
      ].join(", ")}]`,
    });

    if (version === 0) {
      Freezer.log.success(
        `Frozen ${Freezer.bold(name)}, no upcast is needed until second version`
      );
      return true;
    }

    const record = upcastRecord
      .getChildAtIndex(1)
      .getChildAtIndex(1)
      .getChildAtIndex(0)
      .getChildAtIndex(2)
      .asKindOrThrow(SyntaxKind.ObjectLiteralExpression);

    record.addProperty({
      name: `"${version - 1}to${version}"`,
      initializer: `async (previous: ${previousTypeName}): ${typeName} => fixme`,
      kind: StructureKind.PropertyAssignment,
    });
    Freezer.log.success(
      `Frozen ${name}, created upcast ${version - 1} to ${version}`
    );
    return true;
  }

  private static normalizeFilename(filename: string) {
    if (filename.length === 0) {
      return filename;
    }
    return `${filename[0]!.toLowerCase()}${filename.slice(1)}`;
  }

  private getClassDetailsFromDecorator(decorator: Decorator) {
    const classDeclaration = decorator.getParentIfKind(
      SyntaxKind.ClassDeclaration
    );
    if (!classDeclaration) {
      throw new Freezer.UnexpectedError();
    }
    const serializeSymbol = classDeclaration
      .getType()
      .getProperty(Freezer.TOKENS.serializeMethodName);

    if (!serializeSymbol) {
      throw new Freezer.UnexpectedError();
    }

    const [serializeSignature] = this.project
      .getTypeChecker()
      .getTypeOfSymbolAtLocation(serializeSymbol, classDeclaration)
      .getCallSignatures();

    if (!serializeSignature) {
      throw new Freezer.UnexpectedError();
    }

    const className = classDeclaration.getName();

    if (!className) {
      throw new Freezer.UnnamedClassError();
    }

    return {
      className: className,
      serializedType: serializeSignature.getReturnType().getText(),
    };
  }

  private static getDecoratorSymbolFromReference(
    reference: ReferencedSymbolEntry
  ) {
    const decorator = reference
      .getNode()
      .getParent()
      ?.getParent()
      ?.asKind(SyntaxKind.Decorator);
    return decorator;
  }

  private handleFreezeReference(reference: ReferencedSymbolEntry) {
    const decorator = Freezer.getDecoratorSymbolFromReference(reference);
    // Freeze not used as a decorator
    if (!decorator) {
      return;
    }
    const { className, serializedType } =
      this.getClassDetailsFromDecorator(decorator);
    Freezer.log.info(`Freezing ${Freezer.bold(className)}...`);

    const referenceFilepath = reference.getSourceFile().getFilePath();
    const dir = path.dirname(referenceFilepath);
    const upcastFilePath = path.join(
      dir,
      this.relativeDirToGenerateFiles,
      Freezer.normalizeFilename(
        `${className}.${Freezer.TOKENS.upcastFileSuffix}.ts`
      )
    );
    const { version, sourceFile: upcastSourceFile } =
      this.getUpcastSourceFile(upcastFilePath);

    const versionedTypeFilepath = path.join(
      dir,
      this.relativeDirToGenerateFiles,
      Freezer.normalizeFilename(
        `${className}.${Freezer.TOKENS.versionFilesSuffix}.${version}.ts`
      )
    );

    Freezer.log.info(
      `Creating version ${Freezer.bold(version.toString())} source file`
    );
    const versionedTypeSourceFile = this.project.createSourceFile(
      versionedTypeFilepath
    );
    const versionedClassName = `${className}${version}`;
    versionedTypeSourceFile.addTypeAlias({
      name: versionedClassName,
      type: serializedType,
      isExported: true,
    });

    const shouldWrite = this.addVersionToUpcastSourceFile(
      upcastSourceFile,
      className,
      version
    );

    if (shouldWrite) {
      versionedTypeSourceFile.saveSync();
      upcastSourceFile.saveSync();
    }
  }

  public freeze() {
    Freezer.log.info(
      `Freezing using relative directory: ${this.relativeDirToGenerateFiles}`
    );
    const decoratorfile = this.project
      .getSourceFiles()
      .find((e) => e.getFilePath().includes("freeze.ts"));
    if (!decoratorfile) {
      return;
    }
    const freezeFunction = decoratorfile.getFunction(
      Freezer.TOKENS.freezeDecoratorName
    );
    if (!freezeFunction) {
      return;
    }
    const freezeReferences = freezeFunction.findReferences();
    for (const freezeReference of freezeReferences.flatMap((e) =>
      e.getReferences()
    )) {
      this.handleFreezeReference(freezeReference);
    }
  }
}

new Freezer(process.argv[2]).freeze();
