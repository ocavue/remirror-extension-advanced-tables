import { css } from '@emotion/css';
import { ClassName } from '../const';

export const controllerAutoHide = css`
  visibility: hidden;

  .${ClassName.TABLE_SHOW_CONTROLLERS} & {
    visibility: visible !important;
  }
`;
