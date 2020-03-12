<template>
    <v-container fluid>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="8">
                <v-card class="elevation-12">
                    <v-card-text>
                        <v-row>
                            <v-col cols="3">
                                <img :src="user.avatar" alt="" width="100%" />
                            </v-col>
                            <v-col cols="9">
                                <v-simple-table>
                                    <template v-slot:default>
                                        <tbody>
                                            <tr>
                                                <th>Pseudo</th>
                                                <td>{{ user.name }}</td>
                                            </tr>
                                            <tr>
                                                <th>E-mail</th>
                                                <td>{{ user.email }}</td>
                                            </tr>
                                        </tbody>
                                    </template>
                                </v-simple-table>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Profile",
    computed: mapGetters(["user"])
};
</script>

<style></style>
