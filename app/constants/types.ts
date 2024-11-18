export interface PDFVALUES {
  pdfData: {
    id: string;
    pdfName: string;
    frontPage: string;
    key: string;
    allImages: {
      id: string;
      url: string;
      points?: Marker[];
    }[];
  }[];
}

export interface Marker {
  x: number;
  y: number;
  imageIndex: number;
  productId: string;
  product: string;
  productImage: string;
  color: string;
}

interface ImageData {
  id: number;
  url: string;
  points?: Marker[];
}

export interface SINGLEPDF {
  pdfData: {
    images: ImageData[];
    id: string;
  };
}

export interface IMAGES {
  images: ImageData[];
  metaFieldId: string;
  pdfName: string;
}

export interface buttonsNameTypes {
  index: number;
  link: string;
  name: string;
  component: any;
}
