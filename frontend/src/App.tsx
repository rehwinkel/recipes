import { Navigate, Route, Routes } from '@solidjs/router';
import ShowFood from './ShowFood';
import FoodList from './FoodList';
import { Component } from 'solid-js';
import AddFood from './AddFood';

const App: Component = () => {
    return (
        <Routes>
            <Route path="/" component={FoodList} />
            <Route path="/create" component={AddFood} />
            <Route path="/recipe/:id" component={ShowFood} />
            <Route path="/*" component={() => <Navigate href="/" />} />
        </Routes>
    );
};

export default App;
