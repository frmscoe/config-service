import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Flow } from '../Flow';
import '../../../../../setup';

class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Assign the mock to the global window object
global.ResizeObserver = ResizeObserver;

describe('Flow component', () => {
  const nodes = [
    { id: '1', type: 'input', data: { label: 'Input Node' }, position: { x: 100, y: 100 } },
    { id: '2', type: 'output', data: { label: 'Output Node' }, position: { x: 300, y: 100 } }
  ];
  const edges = [{ id: 'e1-2', source: '1', target: '2' }];

  test('renders the flow with nodes and edges', () => {
    const handleNodesChange = jest.fn();
    const handleConnect = jest.fn();
    const handleEdgesChange = jest.fn();
    const handleDrop = jest.fn();
    const handleDelete = jest.fn();
    const handleNodeClick = jest.fn();

    const { getByText } = render(
      <Flow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onDrop={handleDrop}
        handleDelete={handleDelete}
        onNodeClick={handleNodeClick}
        flowRef={null}
      />
    );

    // Assert that nodes are rendered
    expect(getByText('Input Node')).toBeInTheDocument();
    expect(getByText('Output Node')).toBeInTheDocument();

    // Assert that edges are rendered
    expect(document.querySelector('.react-flow')).toBeInTheDocument();
  });

  test('calls the onNodeClick handler when a node is clicked', () => {
    const handleNodesChange = jest.fn();
    const handleConnect = jest.fn();
    const handleEdgesChange = jest.fn();
    const handleDrop = jest.fn();
    const handleDelete = jest.fn();
    const handleNodeClick = jest.fn();

    const { getByText } = render(
      <Flow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onDrop={handleDrop}
        handleDelete={handleDelete}
        onNodeClick={handleNodeClick}
        flowRef={null}

      />
    );

    // Click on a node
    fireEvent.click(getByText('Input Node'));

    // Assert that the onNodeClick handler is called
    expect(handleNodeClick).toHaveBeenCalled();
  });

});
