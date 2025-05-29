const verifyTeacher = async (req, res) => {
  try {
    const { userId, documents } = req.body; // documents = [ID proof, certificates]
    
    // Upload documents to Firebase Storage
    const uploadPromises = documents.map(async doc => {
      const fileRef = bucket.file(`teacher-docs/${userId}/${doc.name}`);
      await fileRef.save(doc.buffer);
      return fileRef.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    });

    const urls = await Promise.all(uploadPromises);
    
    // Update teacher status
    await Teacher.findOneAndUpdate(
      { userId },
      { $set: { 
        verification: { 
          status: 'pending', 
          documents: urls 
        } 
      }}
    );

    res.json({ message: 'Verification submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};