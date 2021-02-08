import React, { CSSProperties } from 'jsx-dom';
import { ControllerType } from '../const';

const TableInsertionTriggerArea = () => {
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
        console.debug(e);
      }}
    ></div>
  );
};

const TableInsertionTriggerAreas = ({ controllerType }: { controllerType: ControllerType }) => {
  if (controllerType == ControllerType.COLUMN_CONTROLLER) {
    return (
      <>
        <TableInsertionTriggerArea />
        <TableInsertionTriggerArea />
      </>
    );
  }
  return null;
};

export default TableInsertionTriggerAreas;
