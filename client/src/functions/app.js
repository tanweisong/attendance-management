export default {
  methods: {
    isNull(oValue) {
      if (oValue === null || typeof oValue === "undefined") return true;
      else return false;
    },
    isNullOrEmpty(oValue) {
      if (!this.isNull(oValue) && oValue.toString().trim() !== "") return false;
      else return true;
    }
  }
};
