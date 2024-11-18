import { buttonsNameTypes } from "app/constants/types";

import AnimationTypes from "app/components/AnimationTypes";
import AppSettings from "app/components/AppSettings";
import ButtonDesign from "app/components/ButtonDesign";

export const buttonsName: buttonsNameTypes[] = [
  { index: 1, link: "app", name: "App", component: AppSettings },
  {
    index: 2,
    link: "buttonDesign",
    name: "Button Design",
    component: ButtonDesign,
  },
  {
    index: 3,
    link: "animationTypes",
    name: "Animation Types",
    component: AnimationTypes,
  },
];
