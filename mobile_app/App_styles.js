
import { Column } from 'native-base';
import {StyleSheet} from 'react-native';

const font_size = 20;

export default styles = StyleSheet.create({
    
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#fff'
    },
    top: {
        flex: 0.10,
        paddingTop: 80,
        paddingLeft: 20,
        paddingRight: 20,    
        backgroundColor: 'white'
    },
    middle: {
        flex: 0.75,
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    bottom: {
        flex: 0.15,
        backgroundColor: '#4a4d57'
    },

    appContainer: {
        backgroundColor: 'beige',
        borderWidth: 3,
        borderRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 5,  
        elevation: 5,
        flexDirection: 'column',
        justifyContent: 'space-around'
    },

    predictor: {
        padding: 8,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    label: {
        width: "40%",
        textAlign: "right",
        paddingRight: 5,
        fontSize: font_size-4
    },

    input: {
        width: "60%",
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        padding: 5
    },

    select: {
        minWidth: 0,
        minHeight: 35,
        width: "80%",
        backgroundColor: "#fff",
        opacity: 1
    },

    radio: {
        width: "60%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
    },
    
    radioView: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    
    radioLabel: {
        textAlign: "left",
        marginLeft: 5
    },

    fieldset: {
        display: "flex",
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: "2%",
        paddingTop: 5,
        paddingBottom: 5,
        flexDirection: "col",
        justifyContent: "center",
        alignItems: "center"
    },

    metricSI: {
        width: "60%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 5
    },

    metricSIComp: {
        width: "45%",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row"
    },

    submitBtnContainer: {
        padding: 8,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },

    submitBtn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%',
        height: 30,
        backgroundColor: '#EA4C89',
        borderRadius: 8
    },

    error: {
        fontSize: font_size-4,
        textAlign: 'center',
        color: '#ef0707',
        paddingTop: 10,
    },

    header: {
        display: 'flex',
        flexDirection: 'row',
        height: '8%',
        justifyContent: 'space-between',
        padding: 5
    },

    heading: {
        fontSize: font_size,
        fontWeight: 'bold'
    },

    strong: {
        fontWeight: 'bold'
    },

    predictions: {
        display: 'flex',
        justifyContent: 'space-around',
        height: '85%',
        padding: 10,
        borderWidth: 1,
        borderRadius: 20
    },

    summary: {
        fontSize: font_size-4
    },

    disclaimer: {
        display: 'flex',
        height: '85%',
        justifyContent: 'space-between'
    }
});