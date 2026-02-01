import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import PriceForecasting from './pages/PriceForecasting';
import CropPlanner from './pages/CropPlanner';
import Chatbot from './pages/Chatbot';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/recommend" element={<CropRecommendation />} />
                    <Route path="/disease" element={<DiseaseDetection />} />
                    <Route path="/yield" element={<YieldPrediction />} />
                    <Route path="/forecast" element={<PriceForecasting />} />
                    <Route path="/planner" element={<CropPlanner />} />
                    <Route path="/chat" element={<Chatbot />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
