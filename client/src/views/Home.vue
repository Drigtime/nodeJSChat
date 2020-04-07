<template>
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" class="text-center">
        <!-- <div class="home"> -->
        <img alt="Vue logo" src="../assets/logo.png" />
        <p>Chat created with NodeJS & VueJS</p>
        <v-divider class="py-3"></v-divider>
        <p>Source code available on my github</p>
        <v-btn large icon color="black" href="https://github.com/Drigtime/nodeJSChat">
          <v-icon>mdi-github-circle</v-icon>
        </v-btn>
        <!-- <Login msg="Welcome to Your Vue.js App" /> -->
        <!-- </div> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// @ is an alias to /src
// import Login from "@/components/Login.vue";

export default {
  name: "Home",
  components: {
    // Login
  }
};
</script>
