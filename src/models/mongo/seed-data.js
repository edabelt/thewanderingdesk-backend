export const seedData = {

  users: {

    _model: "User",

    homer: {
      firstName: "Homer",
      lastName: "Simpson",
      email: "homer@simpson.com",
      password: "secret"
    },

    marge: {
      firstName: "Marge",
      lastName: "Simpson",
      email: "marge@simpson.com",
      password: "secret"
    },

    bart: {
      firstName: "Bart",
      lastName: "Simpson",
      email: "bart@simpson.com",
      password: "secret"
    }

  },

  playlists: {

    _model: "Playlist",

    remoteWork: {
      title: "Remote Work Cafés",
      userid: "->users.bart"
    },

    coworking: {
      title: "Coworking Spaces",
      userid: "->users.marge"
    }

  },

  tracks: {

    _model: "Track",

    workspace_1: {

      name: "Work Café Dublin",

      locationName: "Dublin",

      latitude: 53.3498,

      longitude: -6.2603,

      description:
        "Quiet café with fast Wi-Fi and good coffee.",

      image:
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",

      playlistid:
        "->playlists.remoteWork"

    },

    workspace_2: {

      name: "Galway Hub",

      locationName: "Galway",

      latitude: 53.2707,

      longitude: -9.0568,

      description:
        "Coworking space near the city centre.",

      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36",

      playlistid:
        "->playlists.remoteWork"

    },

    workspace_3: {

      name: "Innovation Dock",

      locationName: "Cork",

      latitude: 51.8985,

      longitude: -8.4756,

      description:
        "Modern workspace for startups and freelancers.",

      image:
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72",

      playlistid:
        "->playlists.coworking"

    }

  }

};