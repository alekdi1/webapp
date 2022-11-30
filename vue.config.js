const isProd = process.env.NODE_ENV === "production"

module.exports = {
	productionSourceMap: false,
	transpileDependencies: [
		"vuetify"
	],
	configureWebpack: () => {
		return {
			devtool: isProd ? false : "source-map"
		}
	}
}

