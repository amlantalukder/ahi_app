import { StatusBar } from 'expo-status-bar';
import { ImageBackground, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Pressable, Keyboard } from 'react-native';
import { NativeBaseProvider, Select, CheckIcon, Box, Center } from 'native-base';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/AntDesign';
import Button from 'react-native-button';

import { useState } from "react";
import styles from "./App_styles";

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}> 
    {children}
  </TouchableWithoutFeedback>
);

const Example = () => {
  const [service, setService] = useState("");
  return <Center>
      <Box maxW="300">
        <Select selectedValue={service} minWidth="200" accessibilityLabel="Choose Service" placeholder="Choose Service" placeholderTextColor="#000" _selectedItem={{
        bg: "teal.600",
        endIcon: <CheckIcon size="5" />
      }} mt={1} onValueChange={itemValue => setService(itemValue)}>
          <Select.Item label="UX Research" value="ux" />
          <Select.Item label="Web Development" value="web" />
          <Select.Item label="Cross Platform Development" value="cross" />
          <Select.Item label="UI Designing" value="ui" />
          <Select.Item label="Backend Development" value="backend" />
        </Select>
      </Box>
    </Center>;
};

function RadioButton(props) {
  return (
      <View style={[{
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      }, props.style]}>
        {
          props.checked ?
            <View style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: '#000',
            }}/>
            : null
        }
      </View>
  );
}

function App() {
  const [data, setData] = useState({ sex: "M", age: "", weight: "", weight_lb: "", height: "", initialo2: "", initialhr: "", initialrr: "" });
  const [metric, setMetric] = useState("IMPERIAL");
  const [ahi_level, setAHILevel] = useState(15);
  const [status_text, setStatus] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const predictors = [
    ["sex", "Sex", [0, 1], ],
    ["age", "Age (Years)", [13, 120], "13 up"],
    ["initialo2", "O2 (%)", [90, 100], "e.g., 98"],
    ["initialhr", "Heart Rate (bpm)", [40, 150], "e.g., 70"],
    ["initialrr", "Respiratory Rate (bpm)", [5, 50], "e.g., 16"],
  ];
  const [is_open_height_ft, setOpenHeightFt] = useState(false);
  const [is_open_height_in, setOpenHeightIn] = useState(false);
  const [height_ft, setHeightFt] = useState('');
  const [height_in, setHeightIn] = useState('');

  const predictors_unit_based = {
    METRIC: { weight: ["Weight (kg)", [3, 300], "e.g., 70"], height: ["Height (cm)", [30, 300], "e.g. 180"]},
    IMPERIAL: {
      weight_lb: ["Weight (lb)", [8, 700], "e.g. 150"],
      height_ft: ["Height", [2, 3, 4, 5, 6, 7]],
      height_in: ["Height", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
    },
  };

  const validate = () => {
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
      let value;
      if(name === 'height_ft'){
        value = height_ft;
      } else if(name === 'height_in'){
        value = height_in;
      } else {
        value = data[name];
      }
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

  const onChange = (name, value, v) => {
    setData({ ...data, [name]: value });
  };

  const onChangeMetric = (value) => {
    setMetric(value);
    setHeightFt("");
    setHeightIn("");
    setOpenHeightFt(false);
    setOpenHeightIn(false);
    setData({ ...data, weight: "", weight_lb: "", height: "", height_ft: "", height_in: "" });
  };

  const onSubmit = () => {

    if (!validate()) return;

    if (metric === 'METRIC'){
      w = data['weight'];
      h = data['height'];
    } else {
      w = (0.454 * parseFloat(data['weight_lb'])).toString();
      h = (2.54 * (parseFloat(height_ft) * 12 + parseFloat(height_in))).toString();
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sex: data['sex'], 
        age: data['age'], 
        weight: w,
        height: h,
        initialo2: data['initialo2'], 
        initialhr: data['initialhr'], 
        initialrr: data['initialrr']
      }),
    };

    console.log(requestOptions);

    console.log("Fetching...");
    setStatus("Fetching data from server...");

    fetch("https://manticore.niehs.nih.gov/ahi/api/", requestOptions)
      .then((response) => {
        console.log(JSON.stringify(response));
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
          setModalVisible(true);
        }
      })
      .catch((error) => {
        console.log('heelo' + error);
      });
  };

  return (
    <DismissKeyboard>
    <View style={styles.container}>
      <ImageBackground source={require('./assets/background-pattern-poly.gif')} style={{width: '100%', height: '100%'}} resizeMode="repeat">
      <View style={styles.top}>
      <ImageBackground source={require('./assets/niehs-logo.png')} resizeMode="contain" style={{width: '100%', height: '100%'}}>
      <Text style={styles.text}></Text>
      </ImageBackground>
      </View>
      <View style={styles.middle}>
        <View style={[styles.appContainer, {display: (modalVisible === false ? 'block' : 'none')}]}>
          {predictors.map(([c, v, range, placeholder]) => {
              return (
                c !== "weight" &&
                c !== "height" && (
                <>
                  <View style={styles.predictor}>
                    <Text style={styles.label}>{v}:</Text>
                    {c === "sex" ? (
                      <View style={styles.radio}>
                        {[
                          ["Male", "M", "_male"],
                          ["Female", "F", "_female"],
                        ].map(([k, v, suffix]) => {
                          return (
                            <View style={styles.radioView}>
                              <Pressable onPress={()=> {onChange(c, v)}}><RadioButton checked={data[c] === v}></RadioButton></Pressable>
                              <Text style={styles.radioLabel}>{k}</Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : (
                      <TextInput 
                      style={styles.input} 
                      keyboardType="numeric" 
                      placeholder={placeholder} 
                      value={data[c]} 
                      onChangeText={(value) => onChange(c, value)} />
                    )}
                  </View>
                  {c === "age" && (
                    <View style={styles.fieldset}>
                      <View style={styles.predictor}>
                        <Text style={styles.label}>Unit System:</Text>
                        <View style={styles.radio}>
                          {[
                            ["Imperial", "IMPERIAL", "_imp"],
                            ["Metric", "METRIC", "_met"],
                          ].map(([k, v, suffix]) => {
                            return (
                              <View style={styles.radioView}>
                                <Pressable onPress={()=> {onChangeMetric(v)}}><RadioButton checked={metric === v}></RadioButton></Pressable>
                                <Text style={styles.radioLabel}>{k}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                      {metric === "METRIC" ? (
                          <>
                            <View style={styles.predictor}>
                              <Text style={styles.label}>{predictors_unit_based[metric]["weight"][0]}:</Text>
                              <TextInput 
                              style={styles.input} 
                              keyboardType="numeric" 
                              placeholder={predictors_unit_based[metric]["weight"][2]} 
                              value={data["weight"]} 
                              onChangeText={(value) => onChange("weight", value)} />
                            </View>
                            <View style={styles.predictor}>
                              <Text style={styles.label}>{predictors_unit_based[metric]["height"][0]}:</Text>
                              <TextInput 
                              style={styles.input} 
                              keyboardType="numeric" 
                              placeholder={predictors_unit_based[metric]["height"][2]} 
                              value={data["height"]} 
                              onChangeText={(value) => onChange("height", value)} />
                            </View>
                          </>
                        ) : (
                          <>
                            <View style={styles.predictor}>
                              <Text style={styles.label}>{predictors_unit_based[metric]["weight_lb"][0]}:</Text>
                              <TextInput style={styles.input} 
                              keyboardType="numeric" 
                              placeholder={predictors_unit_based[metric]["weight_lb"][2]} 
                              value={data["weight_lb"]} 
                              onChangeText={(value) => onChange("weight_lb", value)} />
                            </View>
                            <View style={styles.predictor}>
                              <Text style={styles.label}>{predictors_unit_based[metric]["height_ft"][0]}:</Text>
                              <View style={styles.metricSI}>
                                <View style={styles.metricSIComp}>
                                <DropDownPicker
                                  style={styles.select}
                                  open={is_open_height_ft}
                                  setOpen={() => setOpenHeightFt(!is_open_height_ft)} 
                                  value={height_ft} 
                                  placeholder=""
                                  setValue={setHeightFt}
                                  dropDownDirection="TOP"
                                  items={predictors_unit_based[metric]["height_ft"][1].map((i) => {
                                    return {label:i, value:i}
                                  })}
                                />
                                <Text style={styles.metricSICompLabel}>(ft)</Text>
                                </View>
                                <View style={styles.metricSIComp}>
                                <DropDownPicker
                                  style={styles.select}
                                  open={is_open_height_in}
                                  setOpen={setOpenHeightIn} 
                                  value={height_in} 
                                  placeholder=""
                                  zIndex={1000}  
                                  setValue={setHeightIn}
                                  dropDownDirection="TOP"
                                  items={predictors_unit_based[metric]["height_in"][1].map((i) => {
                                    return {label:i, value:i}
                                  })} 
                                />
                                <Text style={styles.metricSICompLabel}>(in)</Text>
                                </View>
                              </View>
                            </View>
                          </>
                        )}
                    </View>
                  )}
                </>
                )
              );
            })}
            <View style={styles.submitBtnContainer}>
              <Button
                style={{ fontSize: 15, color: 'white' }}
                containerStyle={styles.submitBtn}
                onPress={onSubmit}>
                Predict my OSA risk
              </Button>
            </View>
            {status_text ? <Text style={styles.error}>{status_text}</Text> : ""}
        </View>
        <View style={[styles.appContainer, {display: (modalVisible === true ? 'block' : 'none')}]}>
          <View style={styles.header}>
          <Text style={styles.heading}>OSA Prediction</Text>
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.close}>
              <Icon name={'closesquareo'} size={30} />
          </TouchableOpacity>
          </View>
          {ahi_level > 0 && (
            <View style={styles.predictions}>
              <Text style={styles.summary}>
                You are predicted to have a <Text style={styles.strong}>{ahi_level > 0.5 ? "higher" : "lower"}</Text> risk for moderate to severe sleep apnea.
              </Text>
              <View style={styles.disclaimer}>
                <Text>
                  <Text style={styles.strong}>Disclaimer and terms to use:</Text>
                </Text>
                <Text>
                  This model predicts that you are <Text style={styles.strong}>{ahi_level > 0.5 ? "" : "not "}</Text>at higher risk for obstructive sleep apnea.
                </Text>
                <Text>
                  A user must agree that this is a prediction, not a clinical diagnosis. Only your health care provider can diagnose you whether you have obstructive sleep apnea or
                  not.
                </Text>
                <Text>You may discuss with your health care provider about this prediction result. You and your health care provider can choose to ignore this result.</Text>
                <Text>
                  The tool has an average accuracy of 71.8% predicting if a person has a moderate to severe sleep apnea (AHI &gt; 15) and an average accuracy of 63.2% if a person
                  does not have a moderate to severe sleep apnea (AHI &le; 15). Neither accuracy is 100%. Many other factors such as comorbidities are not included in the model.
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.bottom}>
      <ImageBackground source={require('./assets/footer-graphic.png')} resizeMode="cover" style={{width: '100%', height: '100%'}}>
      <Text style={styles.text}></Text>
      </ImageBackground>
      </View>
      </ImageBackground>
    </View>
    </DismissKeyboard>
  );
}

export default App;