import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data
export const storeData = async (key: string, value: any) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error("Error saving data:", e);
  }
};

// Load data
export const getData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error("Error loading data:", e);
    return null;
  }
};

// Remove data
export const removeData = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Error removing data:", e);
  }
};

export const saveSelection = async (selection: any) => {
  await storeData("gtCourseSelections", selection);
};

export const loadSelection = async () => {
  return await getData("gtCourseSelections");
};