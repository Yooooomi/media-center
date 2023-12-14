import * as path from "path";
import * as fs from "fs";
import {
  Project,
  SyntaxKind,
  SourceFile,
  ReferencedSymbolEntry,
  Decorator,
  TypeAliasDeclaration,
  IndentationText,
  Type,
  ts,
} from "ts-morph";

class Logger {
  static info = (...args: any) =>
    console.log("[\x1b[34mINFO\x1b[0m]:", ...args);
  static success = (...args: any) =>
    console.log("[\x1b[32mINFO\x1b[0m]:", ...args);
  static noop = (...args: any) =>
    console.log("[\x1b[33mINFO\x1b[0m]:", ...args);
  static warn = (...args: any) => console.log("[WARN]:", ...args);
  static bold(str: string) {
    return `\x1b[1m${str}\x1b[0m`;
  }
}

class FilenameUtils {
  static normalize(filename: string) {
    if (filename.length === 0) {
      return filename;
    }
    return `${filename[0]!.toLowerCase()}${filename.slice(1)}`;
  }
}

class ClassFreezer {
  constructor(
    private readonly project: Project,
    private readonly relativeDir: string,
    private readonly classReferencing: ReferencedSymbolEntry,
    private readonly erase: boolean
  ) {}

  private getDetailsFromReference() {
    const decorator = ClassFreezer.getDecoratorSymbolFromReference(
      this.classReferencing
    );
    // Freeze not used as a decorator
    if (!decorator) {
      throw new ClassFreezer.NotUsedAsDecorator();
    }
    return this.getClassDetailsFromDecorator(decorator);
  }

  private readonly thisModuleName = "@media-center/domain-driven";
  private readonly ensureFrozen = "EnsureFrozen";
  private readonly serializeMethodName = "serialize";
  private readonly upcastSerializerBaseClassName = "UpcastSerializer";
  private readonly versionUpcasterBaseClassName = "VersionUpcaster";
  private readonly upcastManifestBaseClassName = "UpcastManifest";
  private readonly upcastClassNameSuffix = "UpcastManifest";
  private readonly versionsArrayTypeName = "Versions";
  private readonly manifestVariableName = "manifest";
  private readonly versionFileSuffix = "version";
  private readonly upcastFileSuffix = "upcast";

  public readonly className = this.getDetailsFromReference().className;
  private readonly serializedType =
    this.getDetailsFromReference().serializedType;
  private readonly sourceFilename = path.basename(
    this.classReferencing.getSourceFile().getFilePath()
  );
  private readonly sourceDir = path.dirname(
    this.classReferencing.getSourceFile().getFilePath()
  );
  private readonly destinationDir = path.join(this.sourceDir, this.relativeDir);
  private readonly pathBackToSourceFile = path.relative(
    this.destinationDir,
    this.sourceDir
  );
  private readonly upcastFilepath = path.join(
    this.destinationDir,
    `${FilenameUtils.normalize(this.className)}.${this.upcastFileSuffix}.ts`
  );
  private readonly upcastClassName = `${this.className}${this.upcastClassNameSuffix}`;
  private readonly upcastSerializerClassName = `${this.className}${this.upcastSerializerBaseClassName}`;

  private versionUpcastFilename(version: number) {
    return `${FilenameUtils.normalize(this.className)}.${
      this.upcastFileSuffix
    }.${version - 1}-${version}.ts`;
  }

  private versionUpcastFilepath(version: number) {
    return path.join(this.destinationDir, this.versionUpcastFilename(version));
  }

  private versionUpcasterClassName(version: number) {
    return `${this.className}UpcastFrom${version - 1}To${version}`;
  }

  private versionizeClassName(version: number) {
    return `${this.className}${version}`;
  }

  private versionTypeFilepath(version: number) {
    return path.join(
      this.destinationDir,
      `${FilenameUtils.normalize(this.className)}.${
        this.versionFileSuffix
      }.${version}.ts`
    );
  }

  private getVersionFileName(version: number) {
    return `${FilenameUtils.normalize(this.className)}.${
      this.versionFileSuffix
    }.${version}.ts`;
  }

  private importifyFilepath(filepath: string) {
    const { dir, name } = path.parse(filepath);
    const finalPath = path.join(dir, name);
    if (finalPath.startsWith(".")) {
      return finalPath;
    }
    return `./${finalPath}`;
  }

  static UnexpectedError = class extends Error {};
  static UnnamedClassError = class extends Error {
    constructor() {
      super("Cannot freeze unnamed class");
    }
  };
  static NotUsedAsDecorator = class extends Error {};

  private createUpcastSourceFile(filepath: string, className: string) {
    const sourceFile = this.project.createSourceFile(filepath);

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.thisModuleName,
      namedImports: [
        { name: this.upcastSerializerBaseClassName },
        { name: this.upcastManifestBaseClassName },
        { name: this.ensureFrozen },
      ],
    });

    const pathToClass = this.importifyFilepath(
      path.join(this.pathBackToSourceFile, this.sourceFilename)
    );

    sourceFile.addImportDeclaration({
      moduleSpecifier: pathToClass,
      namedImports: [{ name: className }],
    });

    sourceFile.addClass({
      isExported: true,
      name: this.upcastSerializerClassName,
      extends: `${this.upcastSerializerBaseClassName}<${this.className}>`,
      ctors: [
        {
          statements: `super(${this.className}, new ${this.upcastClassName}());`,
        },
      ],
    });
    return sourceFile;
  }

  private createVersionUpcastSourceFile(version: number) {
    const sourceFile = this.project.createSourceFile(
      this.versionUpcastFilepath(version)
    );

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.thisModuleName,
      namedImports: [{ name: this.versionUpcasterBaseClassName }],
    });

    const lastVersion = this.versionizeClassName(version - 1);
    const thisVersion = this.versionizeClassName(version);

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.importifyFilepath(
        this.getVersionFileName(version - 1)
      ),
      namedImports: [{ name: lastVersion }],
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: this.importifyFilepath(this.getVersionFileName(version)),
      namedImports: [{ name: thisVersion }],
    });

    const upcasterClassName = this.versionUpcasterClassName(version);

    sourceFile.addClass({
      name: upcasterClassName,
      extends: `${this.versionUpcasterBaseClassName}<${lastVersion}, ${thisVersion}>`,
      isExported: true,
    });
    Logger.success(
      `Created upcast class from version ${Logger.bold(
        (version - 1).toString()
      )} to ${Logger.bold(version.toString())}, you should implement the upcast`
    );
    return sourceFile;
  }

  private getUpcastSourceFile(className: string) {
    if (!fs.existsSync(this.upcastFilepath)) {
      Logger.info(`Creating upcast source file`);
      return {
        version: 0,
        sourceFile: this.createUpcastSourceFile(this.upcastFilepath, className),
      };
    }
    Logger.info(`Upcast source file existing`);
    const upcastSourceFile = this.project.getSourceFileOrThrow(
      this.upcastFilepath
    );
    const versionsArray = upcastSourceFile
      .getTypeAliasOrThrow(this.versionsArrayTypeName)
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
      .getFirstChildByKindOrThrow(SyntaxKind.TypeLiteral)
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
    version: number
  ) {
    let versionsArray = sourceFile
      .getTypeAlias(this.versionsArrayTypeName)
      ?.asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
    let upcastClassDeclaration = sourceFile
      .getClass(this.upcastClassName)
      ?.asKindOrThrow(SyntaxKind.ClassDeclaration);
    if (!versionsArray) {
      versionsArray = sourceFile
        .addTypeAlias({
          name: this.versionsArrayTypeName,
          type: "[]",
        })
        .asKindOrThrow(SyntaxKind.TypeAliasDeclaration);
    }
    if (!upcastClassDeclaration) {
      upcastClassDeclaration = sourceFile
        .addClass({
          isExported: true,
          name: this.upcastClassName,
          extends: `${this.upcastManifestBaseClassName}<${this.versionsArrayTypeName}, EnsureFrozen<${this.className}, ${this.versionsArrayTypeName}>>`,
          getAccessors: [
            {
              name: this.manifestVariableName,
              statements: "return [];",
            },
          ],
        })
        .asKindOrThrow(SyntaxKind.ClassDeclaration);
    }
    const importStatement = sourceFile.addImportDeclaration({
      moduleSpecifier: this.importifyFilepath(this.getVersionFileName(version)),
      namedImports: [{ name: this.versionizeClassName(version) }],
      isTypeOnly: true,
    });
    const [newVersionImport] = importStatement.getNamedImports();
    if (!newVersionImport) {
      throw new ClassFreezer.UnexpectedError();
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
      const newVersionType = ClassFreezer.resolveImportType(
        newVersionImport.getSourceFile(),
        newVersionImport.getName()
      );
      const lastVersionType = ClassFreezer.resolveImportType(
        lastVersioned.getSourceFile(),
        lastVersioned.getTypeName().getText()
      );
      if (!lastVersionType || !newVersionType) {
        throw new ClassFreezer.UnexpectedError();
      }
      const lastVersionProperties =
        ClassFreezer.getPropertiesOfTypeDeclaration(lastVersionType);
      const newVersionProperties =
        ClassFreezer.getPropertiesOfTypeDeclaration(newVersionType);
      if (
        ClassFreezer.propertiesEqual(
          lastVersionProperties,
          newVersionProperties
        )
      ) {
        Logger.noop(
          `Unnecessary freeze for ${Logger.bold(
            this.className
          )}, (${lastVersionProperties} is equal to ${newVersionProperties})`
        );
        return false;
      }
    }

    versionsArray.set({
      type: `[${[
        ...versions.getElements().map((e) => e.getText()),
        this.versionizeClassName(version),
      ].join(", ")}]`,
    });

    if (version === 0) {
      Logger.success(
        `Frozen ${Logger.bold(
          this.className
        )}, no upcast is needed until second version`
      );
      return true;
    }

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.importifyFilepath(
        this.versionUpcastFilename(version)
      ),
      namedImports: [{ name: this.versionUpcasterClassName(version) }],
    });

    const manifestArray = upcastClassDeclaration
      .getGetAccessorOrThrow(this.manifestVariableName)
      .getFirstChildByKindOrThrow(SyntaxKind.Block)
      .getFirstChildByKindOrThrow(SyntaxKind.ReturnStatement)
      .getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression);

    manifestArray.addElement(
      `new ${this.versionUpcasterClassName(version)}()`,
      {
        useNewLines: true,
      }
    );
    Logger.success(
      `Frozen ${this.className} as ${Logger.bold(
        this.versionizeClassName(version)
      )}`
    );
    return true;
  }

  private createVersionedTypeSourceFile(version: number) {
    const versionedTypeSourceFile = this.project.createSourceFile(
      this.versionTypeFilepath(version),
      undefined,
      {
        overwrite: true,
      }
    );
    const typeAlias = versionedTypeSourceFile.addTypeAlias({
      name: this.versionizeClassName(version),
      type: this.serializedType,
      isExported: true,
    });
    typeAlias.addJsDoc("GENERATED TYPE, DO NOT EDIT");
    return versionedTypeSourceFile;
  }

  private getClassDetailsFromDecorator(decorator: Decorator) {
    const classDeclaration = decorator.getParentIfKind(
      SyntaxKind.ClassDeclaration
    );
    if (!classDeclaration) {
      throw new ClassFreezer.UnexpectedError();
    }
    const serializeSymbol = classDeclaration
      .getType()
      .getProperty(this.serializeMethodName);

    if (!serializeSymbol) {
      throw new ClassFreezer.UnexpectedError();
    }

    const [serializeSignature] = this.project
      .getTypeChecker()
      .getTypeOfSymbolAtLocation(serializeSymbol, classDeclaration)
      .getCallSignatures();

    if (!serializeSignature) {
      throw new ClassFreezer.UnexpectedError();
    }

    const className = classDeclaration.getName();

    if (!className) {
      throw new ClassFreezer.UnnamedClassError();
    }

    return {
      className: className,
      serializedType: serializeSignature
        .getReturnType()
        .getText(undefined, ts.TypeFormatFlags.InTypeAlias),
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

  public match(pattern: string) {
    return this.className.includes(pattern);
  }

  public tryCreateANewVersion(upcastSourceFile: SourceFile, version: number) {
    const versionedTypeSourceFile = this.createVersionedTypeSourceFile(version);

    const serializedTypeDiffers = this.addVersionToUpcastSourceFile(
      upcastSourceFile,
      version
    );

    let versionUpcastSourceFile: SourceFile | undefined;
    if ((serializedTypeDiffers || this.erase) && version !== 0) {
      versionUpcastSourceFile = this.createVersionUpcastSourceFile(version);
    }

    if (serializedTypeDiffers) {
      versionedTypeSourceFile.saveSync();
      upcastSourceFile.saveSync();
      versionUpcastSourceFile?.saveSync();
    }
  }

  public doEraseLastVersion(version: number) {
    const lastVersion = version - 1;
    Logger.info(
      `Erasing type version ${lastVersion} for ${Logger.bold(this.className)}`
    );
    const versionFilepath = this.versionTypeFilepath(lastVersion);
    if (fs.existsSync(versionFilepath)) {
      fs.rmSync(versionFilepath);
    }
    const versionedTypeSourceFile =
      this.createVersionedTypeSourceFile(lastVersion);
    versionedTypeSourceFile.saveSync();
  }

  public freeze() {
    Logger.info(`Freezing ${Logger.bold(this.className)}...`);

    const { version, sourceFile: upcastSourceFile } = this.getUpcastSourceFile(
      this.className
    );
    if (this.erase && version > 0) {
      this.doEraseLastVersion(version);
    } else {
      this.tryCreateANewVersion(upcastSourceFile, version);
    }
  }
}

export class Freezer {
  constructor(
    private readonly relativeDir: string,
    private readonly erase: boolean,
    private readonly only: string
  ) {}

  readonly project = new Project({
    tsConfigFilePath: path.join(process.cwd(), "tsconfig.json"),
    manipulationSettings: {
      useTrailingCommas: true,
      indentationText: IndentationText.TwoSpaces,
    },
  });

  private getFreezeNameNode() {
    for (const sourceFile of this.project.getSourceFiles()) {
      const imports = sourceFile
        .getImportDeclarations()
        .flatMap((e) => e.getNamedImports());
      const fr = imports.find((i) => i.getText() === "Freeze");
      if (fr) {
        return fr.getNameNode();
      }
    }
    return undefined;
  }

  public freeze() {
    Logger.info(`Freezing using relative directory: ${this.relativeDir}`);
    const freezeNameNode = this.getFreezeNameNode();
    if (!freezeNameNode) {
      return;
    }
    const freezeReferences = freezeNameNode.findReferences();
    for (const freezeReference of freezeReferences.flatMap((e) =>
      e.getReferences()
    )) {
      try {
        const classFreezer = new ClassFreezer(
          this.project,
          this.relativeDir,
          freezeReference,
          this.erase
        );
        if (this.only && !classFreezer.match(this.only)) {
          Logger.info(
            `Passing ${Logger.bold(classFreezer.className)}, not matching \"${
              this.only
            }\"`
          );
          continue;
        }
        classFreezer.freeze();
      } catch (e) {
        if (e instanceof ClassFreezer.NotUsedAsDecorator) {
          continue;
        }
        throw e;
      }
    }
  }
}
