import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "About Me",
      trim: true,
      maxlength: 100,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, "About description is required"],
      trim: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const About = mongoose.model("About", aboutSchema);

export default About;
