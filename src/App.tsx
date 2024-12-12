import * as lit from "./lit";

function App() {
  return (
    <>
      <div className="card">
        <hr />
        <button onClick={async () => await lit.runExample()}>Click</button>
        <h5> Check the browser console! </h5>
        <hr />
      </div>
    </>
  );
}

export default App;
