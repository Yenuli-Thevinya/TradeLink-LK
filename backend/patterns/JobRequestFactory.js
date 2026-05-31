const JobRequest = require('../models/JobRequest');

class JobRequestFactory {
 
  static createOpenJob(data) {
    return new JobRequest({
      title: data.title,
      description: data.description,
      category: data.category || 'Other',
      location: data.location || '',
      contactName: data.contactName || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      status: 'Open',            
    });
  }
  static createUrgentJob(data) {
    const job = JobRequestFactory.createOpenJob(data);
    job.title = `[URGENT] ${job.title}`;
    return job;
  }
}

module.exports = JobRequestFactory;