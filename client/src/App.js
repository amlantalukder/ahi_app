import "./App.css";
import { useState } from "react";

function App() {
  const [data, setData] = useState({ sex: "", age: "", weight: "", height: "", initialo2: "", initialhr: "", initialrr: "" });
  const [ahi_level, setAHILevel] = useState(-1);
  const [status_text, setStatus] = useState("");
  const [styles, setStyles] = useState({ results: "none" });
  const predictors = [
    ["sex", "Sex", 0, 1],
    ["age", "Age (Years)", 0, 120],
    ["weight", "Weight (kg)", 4, 300],
    ["height", "Height (cm)", 50, 300],
    ["initialo2", "O2 (%)", 90, 100],
    ["initialhr", "Heart Rate (bpm)", 40, 150],
    ["initialrr", "Respiratory Rate (bpm)", 5, 50],
  ];

  const validate = () => {
    for (let i in predictors) {
      let [name, , min, max] = predictors[i];
      let value = data[name];
      if ((name === "sex" && value !== "M" && value !== "F") || parseFloat(value) < min || parseFloat(value) > max) {
        return false;
      }
    }
    return true;
  };

  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setData({ ...data, [name]: value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
    console.log("Fetching...");

    setStatus("Fetching data from server...");

    fetch("/ahi/api", requestOptions)
      .then((response) => {
        console.log(response);
        if (response.ok) return response.json();
        throw new Error("Server Busy");
      })
      .then((d) => {
        console.log("data", d);
        if (d.error) {
          console.log(d.error);
          setStatus(d.error);
        } else {
          setAHILevel(d.ahi_level);
          setStatus("");
          showResults();
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const showResults = () => {
    setStyles({ results: "block" });
  };

  const hideResults = () => {
    setStyles({ results: "none" });
  };

  return (
    <div className="App">
      <div className="bg-image"></div>
      <div id="app" className="container">
        <form onSubmit={onSubmit} method="post">
          <div className="predictors">
            {predictors.map(([c, v, min, max]) => {
              return (
                <div className="predictor">
                  <label>{v}:</label>
                  {c === "sex" ? (
                    <div className="sex">
                      <div>
                        <input type="radio" id={`${c}_male`} name={c} value="M" checked={data[c] === "M"} onChange={onChange}></input>
                        <label htmlFor={`${c}_male`}>Male</label>
                      </div>
                      <div>
                        <input type="radio" id={`${c}_female`} name={c} value="F" checked={data[c] === "F"} onChange={onChange}></input>
                        <label htmlFor={`${c}_female`}>Female</label>
                      </div>
                    </div>
                  ) : (
                    <input type="number" name={c} placeholder={`${min}-${max}`} value={data[c]} onChange={onChange} min={min} max={max} />
                  )}
                </div>
              );
            })}
            <div className="submit-btn">
              <input type="submit" value="Predict OSA" />
            </div>
          </div>
        </form>
        {status_text ? <div className="error">{status_text}</div> : ""}
      </div>
      <div id="results" className="results" style={{ display: styles["results"] }}>
        <div className="heading">
          <strong>OSA Prediction</strong>
          <a href="#" className="close" onClick={hideResults} />
        </div>
        {ahi_level > 0 && (
          <div className="predictions">
            <p>
              You are predicted to have a <strong>{ahi_level > 0.5 ? "higher" : "Lower"}</strong> risk for moderate to severe sleep apnea
            </p>
            <div className="disclaimer">
              <p>
                <strong>Disclaimer and terms to use:</strong>
              </p>
              <p>
                This model predicts that you are <strong>{ahi_level > 0.5 ? "" : "not "}</strong>at higher risk for obstructive sleep apnea.
              </p>
              <p>
                A user must agree that this is a prediction, not a clinical diagnosis. Only your health care provider can diagnose you whether you have obstructive sleep apnea or
                not.
              </p>
              <p>You may discuss with your health care provider about this prediction result. You and your health care provider can choose to ignore this result.</p>
              <p>
                The tool has an average accuracy of 71.8% predicting if a person has a moderate to severe sleep apnea (AHI &gt; 15) and an average accuracy of 63.2% if a person
                does not have a moderate to severe sleep apnea (AHI &le; 15). Neither accuracy is 100%. Many other factors such as comorbidities are not included in the model.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
