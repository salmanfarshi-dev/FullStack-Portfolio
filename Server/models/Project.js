import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
      maxlength: 250,
    },

    description: {
      type: String,
      required: [true, "Project description is required"],
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    images: {
      type: [String],
      default: [],
    },

    technologies: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      enum: ["frontend", "fullstack", "backend", "other"],
      default: "other",
    },

    liveUrl: {
      type: String,
      default: "",
      trim: true,
    },

    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({
  isPublished: 1,
  isFeatured: 1,
  displayOrder: 1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
