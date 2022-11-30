<template>
    <div class="auth-page">
        <v-card class="auth-card rounded-xl ma-3" width="900" min-width="900" max-width="900" height="640" color="#fefdfb">
            <v-row style="height: 100%;" class="pa-0 ma-0">
                <div style="height: 100%;" class="img-col pa-0" />
                <div class="login-form px-7">
                    <slot name="auth-content" />
                </div>
            </v-row>
        </v-card>
    </div>
</template>
<style lang="scss">
.auth-page {
    height: 100vh;
    overflow-y: auto;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow-x: auto;

    $card-width: 900px;

    .auth-card {
        .img-col {
            width: $card-width * 0.6;
            max-width: $card-width * 0.6;
            min-width: $card-width * 0.6;
            background-image: url("../../../assets/images/login.jpg");
            border-top-left-radius: 24px !important;
            border-bottom-left-radius: 24px !important;
        }

        .login-form {
            width: $card-width * 0.4;
            min-width: $card-width * 0.4;
            max-width: $card-width * 0.4;
        }
    }
}
</style>