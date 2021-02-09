import { CSSProperties, h } from 'jsx-dom';
import { ControllerType } from '../const';

type TableInsertionTriggerArea = 'left' | 'right';

const TableInsertionTriggerArea = ({ type }: { type: TableInsertionTriggerArea }) => {
  let showButtonTriggerAreaStyle: CSSProperties = {
    flex: 1,
    height: 24,
    position: 'relative',
    zIndex: 12,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    background: 'linear-gradient(to left top, rgba(0, 255, 100, 0.3), rgba(200, 100, 255, 0.3))',
  };

  let buttonStyle: CSSProperties = {
    display: 'none',
    zIndex: 105,

    position: 'absolute',
    width: '24px',
    height: '24px',
    top: '-16px',

    opacity: 1,
  };

  if (type === 'left') buttonStyle.left = '-12px';
  if (type === 'right') buttonStyle.right = '-13px';

  let button = h('button', { style: buttonStyle }, 'a');

  const showButton = () => {
    console.debug('showButton');
    button.style.setProperty('display', 'inherit');
  };
  const hideButton = () => {
    console.debug('hideButton');
    button.style.setProperty('display', 'none');
  };

  return h('div', { style: showButtonTriggerAreaStyle, onMouseLeave: hideButton, onMouseEnter: showButton }, button);
};

const TableInsertionTriggerAreas = ({ controllerType }: { controllerType: ControllerType }) => {
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return [TableInsertionTriggerArea({ type: 'left' }), TableInsertionTriggerArea({ type: 'right' })];
  }
  return [];
};

const TableInsertionButtonWrapper = ({ controllerType }: { controllerType: ControllerType }) => {
  return TableInsertionTriggerAreas({ controllerType });
};

export default TableInsertionButtonWrapper;
