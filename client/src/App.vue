<template>
    <v-app>
        <v-app-bar app color="primary" dark dense>
            <v-toolbar-title>
                <router-link
                    to="/"
                    style="color: white; text-decoration: none;"
                >
                    Chat
                </router-link>
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <div v-if="user">
                <v-menu offset-y>
                    <template v-slot:activator="{ on }">
                        <v-btn icon v-on="on">
                            <v-icon dark>mdi-account-circle</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item to="/user/profile">
                            <v-list-item-icon>
                                <v-icon>mdi-face</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>
                                    Mon profile
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="logout">
                            <v-list-item-icon>
                                <v-icon>mdi-logout</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>
                                    Deconnexion
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </div>
            <Login v-else></Login>
        </v-app-bar>

        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import Login from "./components/Login";
import setAuthToken from "./utils/setAuthToken";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "App",
    components: {
        Login
    },
    computed: mapGetters(["user"]),
    created() {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
        } else {
            setAuthToken();
        }
        this.fetchUser();
    },
    methods: {
        ...mapActions(["fetchUser", "logoutUser"]),
        logout() {
            this.logoutUser();
        }
    }
};
</script>

<style>
/* a.router-link-active {
    color: white !important;
    text-decoration: none;
} */
</style>
