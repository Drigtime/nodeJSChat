<template>
    <v-container fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="4">
                <v-card class="elevation-12">
                    <v-toolbar color="primary" dark flat>
                        <v-toolbar-title>
                            Formulaire d'inscription
                        </v-toolbar-title>
                        <!-- <v-spacer /> -->
                    </v-toolbar>
                    <v-card-text>
                        <v-form ref="registerForm" v-model="valid">
                            <v-text-field
                                v-model="username"
                                label="Nom d'utilisateur"
                                name="username"
                                prepend-icon="mdi-account"
                                type="text"
                                required
                                @keypress.enter="register"
                            />
                            <v-text-field
                                v-model="email"
                                label="Email"
                                name="email"
                                prepend-icon="mdi-at"
                                type="email"
                                :rules="emailRules"
                                required
                                @keypress.enter="register"
                            />
                            <v-text-field
                                v-model="password1"
                                label="Mot de passe"
                                name="password1"
                                prepend-icon="mdi-lock"
                                type="password"
                                :rules="passwordRules"
                                @keypress.enter="register"
                            />
                            <v-text-field
                                v-model="password2"
                                label="Confirmer le mot de passe"
                                name="password2"
                                prepend-icon="mdi-lock"
                                type="password"
                                :rules="[
                                    ...passwordRules,
                                    ...confirmPasswordRule
                                ]"
                                @keypress.enter="register"
                            />
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <router-link to="/login">
                            Déjà inscrit ?
                        </router-link>
                        <v-spacer />
                        <v-btn color="primary" @click="register">
                            S'inscrire
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            valid: false,
            username: "",
            email: "",
            emailRules: [
                v => !!v || "L'adresse mail est requise",
                v => /.+@.+/.test(v) || "L'adresse mail doit être valide"
            ],
            password1: "",
            password2: "",
            passwordRules: [
                v => !!v || "Le mot de passe est requis",
                v =>
                    v.length >= 6 ||
                    "Le mot de passe doit être plus grand que 6 caractères"
            ],
            confirmPasswordRule: [
                () =>
                    this.password2 === this.password1 ||
                    "Les mots de passe ne correspondent pas."
            ]
        };
    },
    methods: {
        register() {
            if (this.$refs.registerForm.validate()) {
                const config = {
                    headers: {
                        "Content-Type": "application/json"
                    }
                };

                axios
                    .post(
                        "/api/users",
                        {
                            name: this.username,
                            email: this.email,
                            password: this.password1
                        },
                        config
                    )
                    .then(res => {
                        localStorage.setItem("token", res.data.token);
                        this.fetchUser();
                        this.$router.push(this.$route.query.redirect || "/");
                    });
            }
        }
    }
};
</script>
