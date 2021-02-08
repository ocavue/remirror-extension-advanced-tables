import React, { CSSProperties } from 'jsx-dom';
import { ControllerType } from '../const';

const TableInsertionTriggerArea = ({ showButton, hideButton }: { showButton: () => void; hideButton: () => void }) => {
  let addColumnTriggerAreaStyle: CSSProperties = {
    flex: 1,
    height: 24,
    position: 'relative',
    zIndex: 10,

    // Just for debug. Use linear-gradient as background so that we can differentiate two neighbor areas.
    opacity: 0.5,
    background: 'linear-gradient(to left top, teal, pink)',
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
    ></div>
  );
};

const TableInsertionTriggerAreas = ({
  controllerType,
  showButton,
  hideButton,
}: {
  controllerType: ControllerType;
  showButton: () => void;
  hideButton: () => void;
}) => {
  let props = { showButton, hideButton };
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return (
      <>
        <TableInsertionTriggerArea {...props} />
        <TableInsertionTriggerArea {...props} />
      </>
    );
  }
  return null;
};

const TableInsertionButtonWrapper = ({ controllerType }: { controllerType: ControllerType }) => {
  let button = (
    <button className='remirror-table-controller__add-column-button' style={{ display: 'none', zIndex: 105 }}>
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
    <>
      {button}
      <TableInsertionTriggerAreas controllerType={controllerType} showButton={showButton} hideButton={hideButton} />
    </>
  );
};

export default TableInsertionButtonWrapper;
