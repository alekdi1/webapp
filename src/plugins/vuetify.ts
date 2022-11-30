import Vue from "vue"
import Vuetify from "vuetify"
import "vuetify/dist/vuetify.min.css"

Vue.use(Vuetify)

const vuetify = new Vuetify({
	theme: {
		options: {
			customProperties: true
		},
		themes: {
			light: {
				primary: "#B39656",
				secondary: "#ebebeb",
				accent: "#82B1FF",
				error: "#8e031b",
				info: "#2196F3",
				success: "#4CAF50",
				warning: "#FFC107",
				"primary-dark": "#1d1f1d"
			},
		},
	},
	icons: {
		iconfont: "md"
	}
})

export default vuetify
