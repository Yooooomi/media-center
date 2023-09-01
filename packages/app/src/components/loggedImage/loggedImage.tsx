import {Image, ImageProps} from 'react-native';

interface LoggedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
}

export default function LoggedImage({uri, ...other}: LoggedImageProps) {
  return (
    <Image
      {...other}
      source={{
        uri,
        headers: {
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0YTZiMDIxZTE5Y2YxOTljMTM1NGFhMGRiMDZiOTkzMiIsInN1YiI6IjY0ODYzYWRmMDI4ZjE0MDExZTU1MDkwMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yyMkZlhGOGBHtw1yvpBVUUHhu7IKVYho49MvNNKt_wY',
        },
      }}
    />
  );
}
