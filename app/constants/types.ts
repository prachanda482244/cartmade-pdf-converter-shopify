export interface PDFVALUES {
  pdfData: {
    id: string;
    jsonValue: {
      pdfName: string;
      images: {
        url: string;
        points: [];
        id: number;
      }[];
    };
  };
}

export interface Marker {
  x: number;
  y: number;
  imageIndex: number;
  product: string;
  productImage: string;
  color: string;
}

interface ImageData {
  id: number;
  url: string;
  points?: Marker[];
}

export interface IMAGES {
  images: ImageData[];
  metaFieldId: string;
}
