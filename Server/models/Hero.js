import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
  {
    greeting: {
      type: String,
      default: "Hello, I'm",
      trim: true,
      maxlength: 100,
    },

    name: {
      type: String,
      default: "Salman Farshi",
      trim: true,
      maxlength: 100,
    },

    role: {
      type: String,
      default: "Frontend Developer",
      trim: true,
      maxlength: 100,
    },

    headline: {
      type: String,
      required: [true, "Hero headline is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, "Hero description is required"],
      trim: true,
      maxlength: 500,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    availability: {
      type: String,
      default: "Available for opportunities",
      trim: true,
      maxlength: 100,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    primaryButton: {
      text: {
        type: String,
        default: "View Projects",
        trim: true,
      },
      link: {
        type: String,
        default: "#projects",
        trim: true,
      },
    },

    secondaryButton: {
      text: {
        type: String,
        default: "Download CV",
        trim: true,
      },
      link: {
        type: String,
        default: "",
        trim: true,
      },
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

const Hero = mongoose.model("Hero", heroSchema);

export default Hero;
