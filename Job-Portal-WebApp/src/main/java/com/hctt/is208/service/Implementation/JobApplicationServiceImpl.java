package com.hctt.is208.service.Implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.hctt.is208.model.Notification;
import com.hctt.is208.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hctt.is208.DTO.JobApplicationDTO;
import com.hctt.is208.model.JobApplication;
import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.JobApplicationRepository;
import com.hctt.is208.repository.JobPostingRepository;
import com.hctt.is208.repository.UserRepository;
import com.hctt.is208.service.JobApplicationService;

import jakarta.transaction.Transactional;

@Service
public class JobApplicationServiceImpl implements JobApplicationService{
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Override
    public void applyToJob(String userId, int jobId) {
        Optional<JobApplicationDTO> existing = jobApplicationRepository.findByUserAndJobPostId(userId, jobId);
        if (existing.isPresent()) {
            throw new RuntimeException("User already applied to this job");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found!"));

        JobPosting jobPosting = jobPostingRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found!"));

        JobApplication newApplication = new JobApplication();
        newApplication.setApplyDate(LocalDateTime.now());
        newApplication.setState(JobApplication.State.Pending);
        newApplication.setUser(user);
        newApplication.setJobPosting(jobPosting);

        jobApplicationRepository.save(newApplication);
    }

    @Override
    public void removeJobApplication(String userId, int applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Candidate's application not found"));
        
        if(!application.getUser().getId().equals(userId)) {
            throw new RuntimeException("user missmatch");
        }

        jobApplicationRepository.delete(application);
    }

    @Override
    public List<JobApplicationDTO> listApplicationsByUser(String userId) {
        return jobApplicationRepository.findByUserId(userId);
    }

    @Override
    public List<JobApplicationDTO> listApplicationsByUserAndState(String userId, JobApplication.State state) {
        return jobApplicationRepository.findByUserAndState(userId, state);
    }

    @Override
    public List<JobApplicationDTO> listCandidateOfJob(int jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }


    private void createStateChangeNotification(JobApplication application) {
        if (application == null || application.getUser() == null || application.getJobPosting() == null) {
            return;
        }

        String message = "";
       String linkToApplication = "/my-applications";

        if (application.getState() == JobApplication.State.ACCEPTED) {
            message = "Chúc mừng! Đơn ứng tuyển của bạn cho vị trí \"" + application.getJobPosting().getJobTitle() + "\" đã được chấp nhận.";
        } else if (application.getState() == JobApplication.State.REJECTED) {
            message = "Rất tiếc, đơn ứng tuyển của bạn cho vị trí \"" + application.getJobPosting().getJobTitle() + "\" đã bị từ chối.";
        }

        if (!message.isEmpty()) {
            // Cần đảm bảo bạn đã import model Notification
            // import com.hctt.is208.model.Notification;
            Notification notification = new Notification();
            notification.setUser(application.getUser());
            notification.setMessage(message);
            notification.setLink(linkToApplication);

            notificationRepository.save(notification);
        }
    }
    @Override
    @Transactional
    public void updateCandidateState(int applicationId, String state) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Job application with ID " + applicationId + " not found"));


        JobApplication.State newState;

        try {
            newState = JobApplication.State.valueOf(state.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid state value: " + state);
        }

        application.setState(newState);
        JobApplication updatedApplication = jobApplicationRepository.save(application);

        createStateChangeNotification(updatedApplication);

    }

}
