<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Login from "./views/Login.vue";

export default {
  name: "app",
  components: {
    Login
  }
};
</script>

<style lang="scss">
@media print {
  .control-group {
    display: none !important;
  }
  .guestsTable {
    & thead {
      & > tr {
        & th:nth-child(4),
        & th:nth-child(5),
        & th:nth-child(7) {
          display: none !important;
        }
      }
    }
    & tbody {
      & > tr {
        & td:nth-child(4),
        & td:nth-child(5),
        & td:nth-child(7) {
          display: none !important;
        }
      }
    }
  }
  .reduceGuestsTable {
    & thead {
      & > tr {
        & th:nth-child(1),
        & th:nth-child(4) {
          display: none !important;
        }
        & th:nth-child(2) {
          width: 80%;
        }
      }
    }
    & tbody {
      & > tr {
        & td:nth-child(1),
        & td:nth-child(4) {
          display: none !important;
        }
      }
    }
  }
}
.buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}
input[type="number"] {
  text-align: end;
}
.removeButtonBorder {
  border: none !important;
}
</style>
