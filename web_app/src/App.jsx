import "./App.css";
import { useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

function App() {
  const [data, setData] = useState({
    sex: "M",
    age: "",
    weight: "",
    weight_lb: "",
    height: "",
    height_ft: "",
    height_in: "",
    initialo2: "",
    initialhr: "",
    initialrr: "",
  });
  const [metric, setMetric] = useState("IMPERIAL");
  const [ahi_level, setAHILevel] = useState(-1);
  const [status_text, setStatus] = useState("");
  const [agreement, setAgreement] = useState(false);
  const [styles, setStyles] = useState({ results: "none" });
  const predictors = [
    ["sex", "Sex", [0, 1]],
    ["age", "Age (Years)", [13, 120], "13 up"],
    ["initialo2", "O2 (%)", [90, 100], "e.g., 98"],
    ["initialhr", "Heart Rate (bpm)", [40, 150], "e.g., 70"],
    ["initialrr", "Respiratory Rate (bpm)", [5, 50], "e.g., 16"],
  ];

  const predictors_unit_based = {
    METRIC: { weight: ["Weight (kg)", [3, 300], "e.g., 70"], height: ["Height (cm)", [30, 300], "e.g. 180"] },
    IMPERIAL: {
      weight_lb: ["Weight (lb)", [8, 700], "e.g. 150"],
      height_ft: ["Height", [2, 3, 4, 5, 6, 7]],
      height_in: ["Height", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    },
  };

  const validate = () => {
    if (!agreement) {
      setStatus("Please agree with the disclaimer to proceed with the result");
      return false;
    }

    console.log(data);
    for (let i in predictors) {
      let [name, title, [min, max]] = predictors[i];
      let value = data[name];
      console.log(name, value, min, max);
      if (value === "") {
        setStatus(`No value was assigned to ${title}`);
        return false;
      } else if ((name !== "sex" && parseFloat(value) < min) || parseFloat(value) > max) {
        setStatus(`Invalid value was assigned to ${title}, value must be within ${min}-${max}`);
        return false;
      }
    }

    for (let name in predictors_unit_based[metric]) {
      let title = predictors_unit_based[metric][name][0];
      let min = predictors_unit_based[metric][name][1][0];
      let max = predictors_unit_based[metric][name][1].slice(-1);
      let value = data[name];
      console.log(name, value, min, max);
      if (value === "") {
        setStatus(`No value was assigned to ${title}`);
        return false;
      } else if (parseFloat(value) < min || parseFloat(value) > max) {
        setStatus(`Invalid value was assigned to ${title}, value must be within ${min}-${max}`);
        return false;
      }
    }

    return true;
  };

  const onChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (name === "weight_lb") {
      setData({ ...data, [name]: value, ["weight"]: (0.454 * parseFloat(value)).toString() });
    } else if (name === "height_ft") {
      setData({ ...data, [name]: value, ["height"]: (2.54 * (parseFloat(value) * 12 + parseFloat(data["height_in"]))).toString() });
    } else if (name === "height_in") {
      setData({ ...data, [name]: value, ["height"]: (2.54 * (parseFloat(data["height_ft"]) * 12 + parseFloat(value))).toString() });
    } else {
      setData({ ...data, [name]: value });
    }
  };

  const onChangeMetric = (e) => {
    let value = e.target.value;
    console.log(metric);
    setMetric(value);
    setData({ ...data, weight: "", weight_lb: "", height: "", height_ft: "", height_in: "" });
    console.log(metric);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    console.log(data);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    console.log("Fetching...");
    setStatus("Fetching data from server...");

    fetch("/ahi/api/", requestOptions)
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
            {predictors.map(([c, v, range, placeholder]) => {
              return (
                c !== "weight" &&
                c !== "height" && (
                  <>
                    <div className="predictor">
                      <label>{v}:</label>
                      {c === "sex" ? (
                        <div className="radio">
                          {[
                            ["Male", "M", "_male"],
                            ["Female", "F", "_female"],
                          ].map(([k, v, suffix]) => {
                            return (
                              <div>
                                <input type="radio" id={`${c}${suffix}`} name={c} value={v} checked={data[c] === v} onChange={onChange}></input>
                                <label htmlFor={`${c}${suffix}`}>{k}</label>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <input type="number" name={c} placeholder={placeholder} value={data[c]} onChange={onChange} min={range[0]} max={range[1]} />
                      )}
                    </div>
                    {c === "age" && (
                      <div className="fieldset">
                        <div className="predictor">
                          <label>Unit System:</label>
                          <div className="radio">
                            {[
                              ["Imperial", "IMPERIAL", "_imp"],
                              ["Metric", "METRIC", "_met"],
                            ].map(([k, v, suffix]) => {
                              return (
                                <div>
                                  <input type="radio" id={`${c}${suffix}`} name="metric" value={v} checked={metric === v} onChange={onChangeMetric}></input>
                                  <label htmlFor={`${c}${suffix}`}>{k}</label>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {metric === "METRIC" ? (
                          <>
                            <div className="predictor">
                              <label>{predictors_unit_based[metric]["weight"][0]}:</label>
                              <input
                                type="number"
                                name="weight"
                                placeholder={predictors_unit_based[metric]["weight"][2]}
                                value={data["weight"]}
                                onChange={onChange}
                                min={predictors_unit_based[metric]["weight"][1][0]}
                                max={predictors_unit_based[metric]["weight"][1][1]}
                              />
                            </div>
                            <div className="predictor">
                              <label>{predictors_unit_based[metric]["height"][0]}:</label>
                              <input
                                type="number"
                                name="height"
                                placeholder={predictors_unit_based[metric]["height"][2]}
                                value={data["height"]}
                                onChange={onChange}
                                min={predictors_unit_based[metric]["height"][1][0]}
                                max={predictors_unit_based[metric]["height"][1][1]}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="predictor">
                              <label>{predictors_unit_based[metric]["weight_lb"][0]}:</label>
                              <input
                                type="number"
                                name="weight_lb"
                                placeholder={predictors_unit_based[metric]["weight_lb"][2]}
                                value={data["weight_lb"]}
                                onChange={onChange}
                                min={predictors_unit_based[metric]["weight_lb"][1][0]}
                                max={predictors_unit_based[metric]["weight_lb"][1][1]}
                              />
                            </div>
                            <div className="predictor">
                              <label>{predictors_unit_based[metric]["height_ft"][0]}:</label>
                              <div className="metric-si">
                                <div className="metric-si-comp">
                                  <select name={"height_ft"} onChange={onChange} defaultValue={data["height_ft"]}>
                                    <option value=""></option>
                                    {predictors_unit_based[metric]["height_ft"][1].map((i) => {
                                      return <option value={i}>{i}</option>;
                                    })}
                                  </select>
                                  <label>(ft)</label>
                                </div>
                                <div className="metric-si-comp">
                                  <select name={"height_in"} onChange={onChange} defaultValue={data["height_in"]}>
                                    <option value=""></option>
                                    {predictors_unit_based[metric]["height_in"][1].map((i) => {
                                      return <option value={i}>{i}</option>;
                                    })}
                                  </select>
                                  <label>(in)</label>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )
              );
            })}
            <div className="agreement">
              <input
                type="checkbox"
                id="agreement"
                name="agreement"
                onChange={() => {
                  setAgreement(!agreement);
                }}
              ></input>
              <span>
                You agree that this is a model prediction, not a clinical diagnosis and only your health care provider can diagnose you whether you have moderate to severe sleep
                apnea or not.
              </span>
            </div>
            <div className="submit-btn">
              <input type="submit" value="Predict my OSA risk" disabled={!agreement} />
            </div>
          </div>
        </form>
        {status_text ? <div className="error">{status_text}</div> : ""}
      </div>
      <div id="results" className="results" style={{ display: styles["results"] }}>
        <div className="heading">
          <strong>OSA Prediction</strong>
          <IoMdCloseCircle className="close" onClick={hideResults} />
        </div>
        {ahi_level > 0 && (
          <div className="predictions">
            <div className="main-result">
              <p>
                {ahi_level > 0.5 ? (
                  <>
                    You have been predicted to have a <strong>high</strong> risk for moderate to severe sleep apnea. It is recommended that you discuss this prediction with your
                    health care provider.
                  </>
                ) : (
                  <>
                    You have been predicted to have a <strong>low</strong> risk for moderate to severe sleep apnea.
                  </>
                )}
              </p>
            </div>
            <div className="disclaimer">
              <strong>Agreement</strong>
              <p>
                You have agreed that this is a screening tool/prediction, not a clinical test nor a diagnosis. Only your health care provider can diagnose you on whether you have
                moderate to severe sleep apnea.
              </p>
            </div>
            <div className="disclaimer">
              <strong>Disclaimer</strong>
              <ol>
                <li>This web server does not predict whether you have central or mixed sleep apnea.</li>
                <li>
                  The tool has an average accuracy of 71.8% predicting if a person has a moderate to severe sleep apnea (AHI &gt; 15) and an average accuracy of 63.2% if a person
                  does not have a moderate to severe sleep apnea (AHI &le; 15). Neither of the accuracies is at 100%. Many other factors such as comorbidities are not included in
                  the model.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
