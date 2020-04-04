<template>
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10">
        <v-row>
          <v-col cols="12" md="6" class="py-0">
            <v-row>
              <v-col cols="12">
                <edit-picture></edit-picture>
              </v-col>
              <v-col cols="12">
                <edit-profile :user="user"></edit-profile>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" md="6">
            <edit-password></edit-password>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import Password from "../../components/Profile/Password";
import Profile from "../../components/Profile/Profile";
import Picture from "../../components/Profile/Picture";

export default {
  name: "Profile",
  data() {
    return {};
  },
  components: {
    "edit-password": Password,
    "edit-profile": Profile,
    "edit-picture": Picture
  },
  computed: mapGetters(["user"])
};
</script>

<style></style>
