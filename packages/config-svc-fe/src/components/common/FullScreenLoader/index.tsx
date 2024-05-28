import React from 'react';
import { Spin } from 'antd';


const FullScreenLoader = () => {
    return (
        <div className='fixed inset-0 flex justify-center items-center z-50 bg-white bg-opacity-50'>
            <Spin size="large" />
        </div>
    );
};

export default FullScreenLoader;