import { useState } from 'react';
import initialData from './initial-data';
import { Column } from './column';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';

const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background-color: grey;
`;

const App = () => {
	const [state, setState] = useState(initialData);
	const [homeIndex, setHomeIndex] = useState();

	const onDragStart = (start) => {
		document.body.style.color = 'orange';
		const index = state.columnOrder.indexOf(start.source.droppableId);
		setHomeIndex(index);
	};

	const onDragUpdate = (update) => {
		const { destination } = update;
		const opacity = destination
			? destination.index / Object.keys(state.tasks).length
			: 0;
		document.body.style.backgroundColor = `rgba( 153, 141, 217, ${opacity})`;
	};

	const onDragEnd = (result) => {
		document.body.style.color = 'inherit';

		const { destination, source, draggableId, type } = result;

		if (!destination) {
			return;
		}
		if (
			destination.droppableId === source.droppableId &&
			destination.index === source.index
		) {
			return;
		}

		if (type === 'column') {
			const newColumnOrder = [...state.columnOrder];
			newColumnOrder.splice(source.index, 1);
			newColumnOrder.splice(destination.index, 0, draggableId);

			setState({
				...state,
				columnOrder: newColumnOrder,
			});
			return;
		}

		const startColumn = state.columns[source.droppableId];
		const finishColumn = state.columns[destination.droppableId];

		if (startColumn === finishColumn) {
			const newTaskIds = [...startColumn.taskIds];
			newTaskIds.splice(source.index, 1);
			newTaskIds.splice(destination.index, 0, draggableId);

			const newColumn = {
				...startColumn,
				taskIds: newTaskIds,
			};

			setState({
				...state,
				columns: { ...state.columns, [newColumn.id]: newColumn },
			});
			return;
		}

		// Moving from one column to another
		const startTaskIds = [...startColumn.taskIds];
		startTaskIds.splice(source.index, 1);
		const newStart = {
			...startColumn,
			taskIds: startTaskIds,
		};

		const finishTaskIds = [...finishColumn.taskIds];
		finishTaskIds.splice(destination.index, 0, draggableId);
		const newFinish = {
			...finishColumn,
			taskIds: finishTaskIds,
		};

		setState({
			...state,
			columns: {
				...state.columns,
				[newStart.id]: newStart,
				[newFinish.id]: newFinish,
			},
		});
	};

	return (
		<DragDropContext
			onDragEnd={onDragEnd}
			onDragStart={onDragStart}
			onDragUpdate={onDragUpdate}
		>
			<Droppable droppableId="all-columns" type="column">
				{(provided) => (
					<Container
						{...provided.droppableProps}
						ref={provided.innerRef}
					>
						{state.columnOrder.map((columnId, index) => {
							const column = state.columns[columnId];
							const tasks = column.taskIds.map(
								(taskId) => state.tasks[taskId]
							);

							// prevents moving back to previous columns
							const isDropDisabled = index < homeIndex;

							return (
								<Column
									key={column.id}
									column={column}
									tasks={tasks}
									isDropDisabled={isDropDisabled}
									index={index}
								/>
							);
						})}
						{provided.placeholder}
					</Container>
				)}
			</Droppable>
		</DragDropContext>
	);
};

export default App;
