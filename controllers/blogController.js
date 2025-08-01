import blogModel from '../Models/blog.models.js'; 
import cloudinary from '../config/cloudinary.js';

export const createBlog = async (req, res) => {
  try {
    const { title, description, details } = req.body;

    let imageUrl = "";

// console.log("Headers:", req.headers['content-type']);
// console.log("Body:", req.body);
// console.log("File:", req.file);

    if (req.file) {
      const uploadFromBuffer = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'blog_images' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
              // console.log( result);
            }
          );
          stream.end(buffer);
        });
      };

      imageUrl = await uploadFromBuffer(req.file.buffer);
    }
    
    // console.log("Uploaded image URL:", imageUrl);

    
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create and save blog
    const newBlog = new blogModel({ image: imageUrl, title, description, details, owner: userId });
    await newBlog.save();

    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.error("Create blog error: ", error);
    res.status(400).json({ message: "Error creating blog", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await blogModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating title to duplicate
    if (updates.title) {
      const existing = await blogModel.findOne({ title: updates.title, _id: { $ne: id } });

      if (existing) {
        return res.status(400).json({ message: "Title must be unique" });
      }
    }

    const updatedBlog = await blogModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!updatedBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog updated successfully", blog: updatedBlog });
    
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find().populate('owner', 'name email -_id')

    res.status(200).json({status:'success', blogs })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const userId = req.user.id;

    const blogs = await blogModel.find({ owner: userId }).populate('owner', 'name email');

    res.status(200).json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.id;

    const blog = await blogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    if (blog.owner.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await blog.deleteOne();
    res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

