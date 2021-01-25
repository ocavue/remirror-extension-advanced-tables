import React from 'react';

interface MenuProps {
    createTable: () => void
}

const Menu: React.FC<MenuProps> = ({ createTable }) => {
    return (
        <div>
            <button onClick={createTable}>insert a table</button>
        </div>
    )
}

export default Menu