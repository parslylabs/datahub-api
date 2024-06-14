window.onload = function() {
  
      //<editor-fold desc="Changeable Configuration Block">
      window.ui = SwaggerUIBundle({
        url: "https://petstore.swagger.io/v2/swagger.json",
        "dom_id": "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        queryConfigEnabled: false,
        urls: [{name:"dropzone",url:"/parsly-api/api-dropzone-openapi.yaml"},{name:"pickup",url:"/parsly-api/api-pickup-openapi.yaml"}],
      })
      
      //</editor-fold>

};
