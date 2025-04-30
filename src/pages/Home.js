// pages/Home.js
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Home Page</h1>
      <Link to="/lobby" className="text-blue-500 underline">Go to Lobby</Link>
    </div>
  );
}

export default Home;
