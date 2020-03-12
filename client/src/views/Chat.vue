<template>
    <v-container class="pa-0" style="width: 100%; max-width: none">
        <v-row no-gutters style="height: calc(100vh - 96px)">
            <v-col cols="2" sm="3" md="2">
                <v-card height="100%">
                    <!-- <v-navigation-drawer permanent> -->
                    <!-- <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="title">
                            Application
                        </v-list-item-title>
                        <v-list-item-subtitle>
                            subtext
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider> -->

                    <v-list dense nav>
                        <v-list-item link>
                            <v-list-item-content>
                                <v-list-item-title>Test 1</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item link>
                            <v-list-item-content>
                                <v-list-item-title>Test 1</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <!-- <v-list-item
          v-for="item in items"
          :key="item.title"
          link
        >
          <v-list-item-avatar>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
                    </v-list>
                    <!-- </v-navigation-drawer> -->
                </v-card>
            </v-col>
            <v-col>
                <v-card height="100%">
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title
                                >Single-line item</v-list-item-title
                            >
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item two-line>
                        <v-list-item-content>
                            <v-list-item-title>Two-line item</v-list-item-title>
                            <v-list-item-subtitle>
                                Secondary text
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-item three-line>
                        <v-list-item-content>
                            <v-list-item-title>
                                Three-line item
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                Secondary line text Lorem ipsum dolor sit amet,
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>
                                consectetur adipiscing elit.
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-card>
            </v-col>
            <v-col cols="2" sm="3" md="2">
                <v-card height="100%">
                    <!-- <v-navigation-drawer permanent> -->
                    <v-list dense nav>
                        <v-list-item link>
                            <v-list-item-avatar>
                                <v-icon>mdi-account</v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>
                                    Test 1
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item link>
                            <v-list-item-avatar>
                                <v-icon>mdi-account</v-icon>
                            </v-list-item-avatar>
                            <v-list-item-content>
                                <v-list-item-title>
                                    Test 1
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <!-- </v-navigation-drawer> -->
                </v-card>
            </v-col>
        </v-row>
        <v-row no-gutters>
            <v-col cols="12">
                <v-text-field
                    label="Outlined"
                    placeholder="Message ..."
                    hide-details
                    solo
                ></v-text-field>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "Chat"
};
</script>

<style></style>
