import React, { CSSProperties } from 'jsx-dom';
import { ControllerType } from '../const';

type TableInsertionTriggerArea = 'left' | 'right';

const TableInsertionTriggerArea = ({ type }: { type: TableInsertionTriggerArea }) => {
  let addColumnTriggerAreaStyle: CSSProperties = {
    flex: 1,
    height: 24,
    position: 'relative',
    zIndex: 10,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    background: 'linear-gradient(to left top, rgba(0, 255, 169, 0.3), rgba(243, 61, 243, 0.3))',
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

  let button = (
    <button
      // className='remirror-table-controller__add-column-button'
      style={buttonStyle}
    >
      a
    </button>
  );

  const showButton = () => {
    console.debug('showButton');
    button.style.setProperty('display', 'inherit');
  };
  const hideButton = () => {
    console.debug('hideButton');
    button.style.setProperty('display', 'none');
  };

  return (
    <div
      style={addColumnTriggerAreaStyle}
      onMouseOver={(e) => {
        showButton();
      }}
      onMouseOut={(e) => {
        hideButton();
      }}
    >
      {button}
    </div>
  );
};

const TableInsertionTriggerAreas = ({ controllerType }: { controllerType: ControllerType }) => {
  let props = {};
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return (
      <>
        <TableInsertionTriggerArea {...props} type='left' />
        <TableInsertionTriggerArea {...props} type='right' />
      </>
    );
  }
  return null;
};

const TableInsertionButtonWrapper = ({ controllerType }: { controllerType: ControllerType }) => {
  return (
    <>
      <TableInsertionTriggerAreas controllerType={controllerType} />
    </>
  );
};

export default TableInsertionButtonWrapper;
