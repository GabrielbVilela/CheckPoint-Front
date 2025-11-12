import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    flex: 1,
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  logo: {
    height: 216,
    marginBottom: 8,
    resizeMode: "contain",
    width: 720,
  },
  label: {
    backgroundColor: "#f9f9f9",
    color: "#555",
    fontSize: 12,
    left: 10,
    paddingHorizontal: 4,
    position: "absolute",
    top: -10,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 10,
    width: "100%",
  },
  inputError: {
    borderColor: "#e53935",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#42a148ff",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
    width: "100%",
  },
});