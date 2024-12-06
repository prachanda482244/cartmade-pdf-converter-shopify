import { IconSource } from "@shopify/polaris";

export interface PDFVALUES {
  pageInfo: pageInformation;
  pricePlan: any;
  query: string;
  pdfData: {
    id: string;
    pdfName: string;
    frontPage: string;
    date: string;
    size: string;
    key: string;
    allImages: {
      id: string;
      url: string;
      points?: Marker[];
    }[];
  }[];
}

export interface pageInformation {
  endCursor: string;
  startCursor: string;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface Marker {
  pointId: number;
  x: number;
  y: number;
  imageIndex: number;
  productId: string;
  product: string;
  productImage: string;
  color: string;
  xPercentage: number;
  handle: string;
  comparedPrice: string;
  price: string;
  description: string;
  yPercentage: number;
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
  shopName: string;
  images: ImageData[];
  metaFieldId: string;
  pdfName: string;
  hotspotColor: string;
}

export interface buttonsNameTypes {
  index: number;
  link: string;
  name: string;
  component: any;
}

export interface IconItems {
  label: string;
  name: string;
  icon: IconSource | any;
}
export interface ButtonSettings {
  buttonSettings: {
    jsonValue: {
      buttonText: string;
      subtitle: string;
      icon: string;
      sticky: boolean;
      fontSize: number;
      borderRadius: number;
      borderWidth: number;
      shadow: number;
      borderColor: string;
      backgroundColor: string;
      textColor: string;
    };
  };
}
export interface HotspotProps {
  id: string;
  svg: string;
  color: string;
  hoverColor: string;
  label: string;
}
