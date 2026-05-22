export const aboutController = {
  index: {
    handler: function (request, h) {
      const viewData = {
        title: "About Workspace",
      };
      return h.view("about-view", viewData);
    },
  },
};