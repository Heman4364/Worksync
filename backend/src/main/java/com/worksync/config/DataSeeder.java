package com.worksync.config;

import com.worksync.dto.KafkaDtos.KafkaEventPublishRequest;
import com.worksync.entity.*;
import com.worksync.kafka.KafkaReliabilityEngine;
import com.worksync.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final SocialPostRepository postRepository;
    private final DraftRepository draftRepository;
    private final CalendarEventRepository calendarRepository;
    private final NotificationRepository notificationRepository;
    private final WorkflowRuleRepository workflowRuleRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final KafkaReliabilityEngine kafkaEngine;

    public DataSeeder(UserRepository userRepository,
                      WorkspaceRepository workspaceRepository,
                      WorkspaceMemberRepository workspaceMemberRepository,
                      TeamRepository teamRepository,
                      TeamMemberRepository teamMemberRepository,
                      ProjectRepository projectRepository,
                      TaskRepository taskRepository,
                      SocialPostRepository postRepository,
                      DraftRepository draftRepository,
                      CalendarEventRepository calendarRepository,
                      NotificationRepository notificationRepository,
                      WorkflowRuleRepository workflowRuleRepository,
                      ActivityLogRepository activityLogRepository,
                      PasswordEncoder passwordEncoder,
                      KafkaReliabilityEngine kafkaEngine) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.postRepository = postRepository;
        this.draftRepository = draftRepository;
        this.calendarRepository = calendarRepository;
        this.notificationRepository = notificationRepository;
        this.workflowRuleRepository = workflowRuleRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.kafkaEngine = kafkaEngine;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Seeding comprehensive, realistic WorkSync demonstration data for creative teams...");

        // 1. Users (6 Diverse, recognizable team roles)
        User admin = new User("admin@worksync.io", passwordEncoder.encode("admin123"), "Alex", "Mercer", Role.ROLE_ADMIN);
        admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
        admin = userRepository.save(admin);

        User manager = new User("manager@worksync.io", passwordEncoder.encode("manager123"), "Maya", "Lin", Role.ROLE_MANAGER);
        manager.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150");
        manager = userRepository.save(manager);

        User memberLeo = new User("member@worksync.io", passwordEncoder.encode("member123"), "Leo", "Rivera", Role.ROLE_MEMBER);
        memberLeo.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150");
        memberLeo = userRepository.save(memberLeo);

        User memberSophia = new User("sophia@worksync.io", passwordEncoder.encode("sophia123"), "Sophia", "Chen", Role.ROLE_MEMBER);
        memberSophia.setAvatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150");
        memberSophia = userRepository.save(memberSophia);

        User memberMarcus = new User("marcus@worksync.io", passwordEncoder.encode("marcus123"), "Marcus", "Vance", Role.ROLE_MEMBER);
        memberMarcus.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150");
        memberMarcus = userRepository.save(memberMarcus);

        User memberElena = new User("elena@worksync.io", passwordEncoder.encode("elena123"), "Elena", "Rostova", Role.ROLE_MEMBER);
        memberElena.setAvatarUrl("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150");
        memberElena = userRepository.save(memberElena);

        // 2. Workspace
        Workspace ws = new Workspace("BrightSpark Agency", "brightspark-agency", "Creative agency, digital campaigns, and workflow automation hub", admin);
        ws = workspaceRepository.save(ws);

        workspaceMemberRepository.save(new WorkspaceMember(ws, admin, Role.ROLE_ADMIN));
        workspaceMemberRepository.save(new WorkspaceMember(ws, manager, Role.ROLE_MANAGER));
        workspaceMemberRepository.save(new WorkspaceMember(ws, memberLeo, Role.ROLE_MEMBER));
        workspaceMemberRepository.save(new WorkspaceMember(ws, memberSophia, Role.ROLE_MEMBER));
        workspaceMemberRepository.save(new WorkspaceMember(ws, memberMarcus, Role.ROLE_MEMBER));
        workspaceMemberRepository.save(new WorkspaceMember(ws, memberElena, Role.ROLE_MEMBER));

        // 3. Teams
        Team creatorsTeam = new Team(ws, "Coffee & Content Creators ☕", "Instagram Reels, TikTok unboxings, YouTube Shorts, & trend research");
        creatorsTeam = teamRepository.save(creatorsTeam);
        teamMemberRepository.save(new TeamMember(creatorsTeam, admin, "Creative Director"));
        teamMemberRepository.save(new TeamMember(creatorsTeam, memberLeo, "Lead Video Producer"));
        teamMemberRepository.save(new TeamMember(creatorsTeam, memberElena, "Content Copywriter"));

        Team growthTeam = new Team(ws, "Brand Growth Squad 🚀", "Product drop campaigns, community giveaways, & viral marketing");
        growthTeam = teamRepository.save(growthTeam);
        teamMemberRepository.save(new TeamMember(growthTeam, manager, "Campaign Strategist"));
        teamMemberRepository.save(new TeamMember(growthTeam, memberMarcus, "Growth Coordinator"));

        Team designTeam = new Team(ws, "Visual Identity & Design 🎨", "Brand design system, typography, vector assets, and Canva packaging kits");
        designTeam = teamRepository.save(designTeam);
        teamMemberRepository.save(new TeamMember(designTeam, memberSophia, "Senior Brand Designer"));
        teamMemberRepository.save(new TeamMember(designTeam, admin, "Design Advisor"));

        Team prTeam = new Team(ws, "Influencer & PR Relations 📦", "Creator seeding boxes, brand ambassador management, and VIP partnerships");
        prTeam = teamRepository.save(prTeam);
        teamMemberRepository.save(new TeamMember(prTeam, memberMarcus, "Influencer Lead"));
        teamMemberRepository.save(new TeamMember(prTeam, manager, "PR Director"));

        // 4. Projects (6 Comprehensive, Diverse Projects)
        Project p1 = new Project();
        p1.setWorkspace(ws);
        p1.setTeam(growthTeam);
        p1.setManager(manager);
        p1.setTitle("Summer Product Drop ☀️🎒");
        p1.setDescription("Launch our eco-friendly summer collection with viral teaser videos, influencer gift boxes, and live launch event.");
        p1.setStatus(ProjectStatus.ACTIVE);
        p1.setPriority(ProjectPriority.URGENT);
        p1.setStartDate(LocalDate.now().minusDays(10));
        p1.setDueDate(LocalDate.now().plusDays(14));
        p1.setProgressPercentage(75);
        p1 = projectRepository.save(p1);

        Project p2 = new Project();
        p2.setWorkspace(ws);
        p2.setTeam(creatorsTeam);
        p2.setManager(manager);
        p2.setTitle("Downtown Coffee Pop-Up ☕✨");
        p2.setDescription("Weekend coffee pop-up featuring live iced latte tastings, custom branded stickers, and an Instagram selfie booth.");
        p2.setStatus(ProjectStatus.PLANNING);
        p2.setPriority(ProjectPriority.HIGH);
        p2.setStartDate(LocalDate.now().minusDays(4));
        p2.setDueDate(LocalDate.now().plusDays(21));
        p2.setProgressPercentage(35);
        p2 = projectRepository.save(p2);

        Project p3 = new Project();
        p3.setWorkspace(ws);
        p3.setTeam(creatorsTeam);
        p3.setManager(admin);
        p3.setTitle("Viral TikTok & Reels Challenge 🎬🔥");
        p3.setDescription("Community hashtag challenge rewarding 5 mystery gift boxes to creators sharing their aesthetic morning routines.");
        p3.setStatus(ProjectStatus.ACTIVE);
        p3.setPriority(ProjectPriority.HIGH);
        p3.setStartDate(LocalDate.now().minusDays(6));
        p3.setDueDate(LocalDate.now().plusDays(12));
        p3.setProgressPercentage(60);
        p3 = projectRepository.save(p3);

        Project p4 = new Project();
        p4.setWorkspace(ws);
        p4.setTeam(designTeam);
        p4.setManager(admin);
        p4.setTitle("Brand Packaging & Design 2.0 🎨");
        p4.setDescription("Redesign our insulated drinkware packaging, recyclable boxes, color swatch guide, and vector iconography.");
        p4.setStatus(ProjectStatus.ACTIVE);
        p4.setPriority(ProjectPriority.MEDIUM);
        p4.setStartDate(LocalDate.now().minusDays(15));
        p4.setDueDate(LocalDate.now().plusDays(8));
        p4.setProgressPercentage(85);
        p4 = projectRepository.save(p4);

        Project p5 = new Project();
        p5.setWorkspace(ws);
        p5.setTeam(prTeam);
        p5.setManager(manager);
        p5.setTitle("Creator Seeding & PR Gifting Box 📦");
        p5.setDescription("Curate and send 25 customized PR boxes containing drinkware samples, stickers, and handwritten notes to lifestyle vloggers.");
        p5.setStatus(ProjectStatus.ACTIVE);
        p5.setPriority(ProjectPriority.HIGH);
        p5.setStartDate(LocalDate.now().minusDays(5));
        p5.setDueDate(LocalDate.now().plusDays(18));
        p5.setProgressPercentage(50);
        p5 = projectRepository.save(p5);

        Project p6 = new Project();
        p6.setWorkspace(ws);
        p6.setTeam(creatorsTeam);
        p6.setManager(manager);
        p6.setTitle("Podcast Launch: 'Behind the Brew' 🎙️");
        p6.setDescription("10-episode audio & video podcast series interviewing creative agency founders, content creators, and specialty coffee roasters.");
        p6.setStatus(ProjectStatus.PLANNING);
        p6.setPriority(ProjectPriority.LOW);
        p6.setStartDate(LocalDate.now().minusDays(2));
        p6.setDueDate(LocalDate.now().plusDays(35));
        p6.setProgressPercentage(20);
        p6 = projectRepository.save(p6);

        // 5. Tasks (Short, simple, practical tasks for easy understanding)
        // Project 1: Summer Product Drop
        createTask(p1, memberLeo, admin, "Record coffee launch reel ☕", "Film quick 30-sec morning routine video.", TaskStatus.COMPLETED, TaskPriority.URGENT, 1);
        createTask(p1, memberLeo, manager, "Pick TikTok audio track 🎵", "Find upbeat trending background music.", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, 3);
        createTask(p1, memberSophia, admin, "Design 3 promo slides 🎨", "Create story graphics with summer colors in Canva.", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, 4);
        createTask(p1, memberElena, manager, "Write LinkedIn celebration post ✍️", "Announce reaching 25,000 members milestone.", TaskStatus.COMPLETED, TaskPriority.MEDIUM, 2);
        createTask(p1, memberMarcus, manager, "Ship creator gift boxes 📦", "Pack samples and thank-you notes for 10 creators.", TaskStatus.TODO, TaskPriority.HIGH, 6);
        createTask(p1, manager, admin, "Review giveaway contest rules ⚖️", "Check rules and eligibility before publishing.", TaskStatus.COMPLETED, TaskPriority.LOW, 1);

        // Project 2: Downtown Pop-Up
        createTask(p2, memberLeo, manager, "Taste test weekend recipes 🧊", "Pick favorite cold brew flavor: vanilla vs caramel.", TaskStatus.IN_PROGRESS, TaskPriority.LOW, 8);
        createTask(p2, memberSophia, manager, "Order 2,000 coffee cups ☕", "Order eco-friendly branded cups from supplier.", TaskStatus.COMPLETED, TaskPriority.HIGH, 3);
        createTask(p2, memberSophia, admin, "Design photo booth banner 📸", "Create 8x8ft printable photo wall design.", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, 5);
        createTask(p2, manager, admin, "Submit downtown event permit 🏛️", "Send permit paperwork to city plaza office.", TaskStatus.TODO, TaskPriority.HIGH, 10);

        // Project 3: Viral Video Challenge
        createTask(p3, memberMarcus, admin, "Reply to social comments 💬", "Answer questions from fans on Instagram teaser.", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, 2);
        createTask(p3, memberLeo, admin, "Film 3 quick video intros ⚡", "Record 3-second hook variations for reel.", TaskStatus.IN_PROGRESS, TaskPriority.URGENT, 1);
        createTask(p3, memberLeo, manager, "Create challenge audio track 🎵", "Export 15-second sound clip for creators.", TaskStatus.COMPLETED, TaskPriority.HIGH, 3);
        createTask(p3, manager, admin, "Pick top 5 contest winners 🏆", "Shortlist best video entries for public voting.", TaskStatus.TODO, TaskPriority.MEDIUM, 9);

        // Project 4: Brand Packaging
        createTask(p4, memberSophia, admin, "Finalize bottle logo engraving 🖌️", "Export clean vector files for tumbler engraving.", TaskStatus.COMPLETED, TaskPriority.URGENT, 2);
        createTask(p4, memberSophia, admin, "Check packaging box sample 📦", "Inspect printed box proof before bulk production.", TaskStatus.BLOCKED, TaskPriority.HIGH, 4);
        createTask(p4, memberSophia, admin, "Export brand style guide PDF 📖", "Save reference guide with brand fonts and colors.", TaskStatus.COMPLETED, TaskPriority.MEDIUM, 5);

        // Project 5: Creator Gift Box
        createTask(p5, memberMarcus, manager, "Get creator delivery addresses 📋", "Collect shipping details from 25 creators.", TaskStatus.COMPLETED, TaskPriority.MEDIUM, 2);
        createTask(p5, memberElena, manager, "Write creator thank-you cards ✍️", "Write short personalized notes for gift boxes.", TaskStatus.IN_PROGRESS, TaskPriority.LOW, 6);
        createTask(p5, memberMarcus, manager, "Confirm dates with ambassadors 🤝", "Agree on unboxing dates with top creators.", TaskStatus.IN_REVIEW, TaskPriority.HIGH, 4);
        createTask(p5, memberSophia, manager, "Order stickers & tissue paper ✨", "Order branded gold foil stickers.", TaskStatus.COMPLETED, TaskPriority.MEDIUM, 1);

        // Project 6: Podcast Launch
        createTask(p6, memberLeo, manager, "Book podcast recording studio 🎙️", "Reserve studio session for Episode 1 recording.", TaskStatus.TODO, TaskPriority.MEDIUM, 12);
        createTask(p6, memberElena, manager, "Write 10 interview questions 📝", "Prepare questions on scaling a creative team.", TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, 7);
        createTask(p6, memberSophia, manager, "Design Spotify podcast cover 🎧", "Create clean 3000x3000px cover artwork.", TaskStatus.IN_REVIEW, TaskPriority.HIGH, 8);

        // 6. Social Posts (Published, Scheduled, and Cross-Platform)
        SocialPost post1 = new SocialPost();
        post1.setWorkspace(ws);
        post1.setAuthor(admin);
        post1.setPlatform(SocialPlatform.LINKEDIN);
        post1.setContent("We officially crossed 25,000 happy community members this week! 🎉 Building in public taught our team that listening to customer feedback is the ultimate superpower. Huge shoutout to our creators! 🚀 #Leadership #CommunityFirst #CreatorEconomy");
        post1.setStatus(PostStatus.PUBLISHED);
        post1.setPublishedAt(LocalDateTime.now().minusHours(3));
        post1.setEventId("post-live-01");
        postRepository.save(post1);

        SocialPost post2 = new SocialPost();
        post2.setWorkspace(ws);
        post2.setAuthor(manager);
        post2.setPlatform(SocialPlatform.X);
        post2.setContent("Sneak peek of what drops this Friday... 👀 Hint: It keeps your coffee iced for 24 hours straight 🧊☕ Drop your guesses below! 👇 #SneakPeek #SummerDrop #CoffeeVibes");
        post2.setStatus(PostStatus.SCHEDULED);
        post2.setScheduledAt(LocalDateTime.now().plusDays(2).withHour(11).withMinute(0));
        post2.setEventId("post-sched-02");
        postRepository.save(post2);

        SocialPost post3 = new SocialPost();
        post3.setWorkspace(ws);
        post3.setAuthor(memberLeo);
        post3.setPlatform(SocialPlatform.INSTAGRAM);
        post3.setContent("Morning routine bliss ✨ Grab your iced latte and let's crush today's goals! Which tumbler color is your favorite? 1, 2 or 3? 👇 #AestheticVibes #MorningRoutine #CoffeeLovers #SummerVibes");
        post3.setStatus(PostStatus.PUBLISHED);
        post3.setPublishedAt(LocalDateTime.now().minusDays(1));
        post3.setEventId("post-insta-03");
        postRepository.save(post3);

        SocialPost post4 = new SocialPost();
        post4.setWorkspace(ws);
        post4.setAuthor(memberElena);
        post4.setPlatform(SocialPlatform.LINKEDIN);
        post4.setContent("How our creative studio eliminated 2-hour status meetings in favor of 15-minute morning coffee syncs. ☕ Productive teams don't need endless slides—they need clarity and momentum. What's your team's favorite meeting hack? 👇 #Productivity #Culture #RemoteWork");
        post4.setStatus(PostStatus.SCHEDULED);
        post4.setScheduledAt(LocalDateTime.now().plusDays(3).withHour(9).withMinute(30));
        post4.setEventId("post-sched-04");
        postRepository.save(post4);

        SocialPost post5 = new SocialPost();
        post5.setWorkspace(ws);
        post5.setAuthor(memberLeo);
        post5.setPlatform(SocialPlatform.INSTAGRAM);
        post5.setContent("Behind the scenes at our Friday studio shoot 🎬 3 cameras, 5 gallons of cold brew, and endless laughs. Stay tuned for the summer drop teaser video dropping tomorrow! 🔥 #BehindTheScenes #CreativeStudio #Filmmaking #CoffeeCulture");
        post5.setStatus(PostStatus.SCHEDULED);
        post5.setScheduledAt(LocalDateTime.now().plusDays(1).withHour(16).withMinute(0));
        post5.setEventId("post-sched-05");
        postRepository.save(post5);

        // 7. Drafts (Ready for review and scheduling)
        draftRepository.save(new Draft(ws, memberLeo, SocialPlatform.INSTAGRAM, "Studio Behind the Scenes Reel 🎥",
                "A chaotic day in the life of our creative studio! Warning: lots of spilled iced coffee and laughter 😂 Grab a cup and join us! #BehindTheScenes #StudioLife #CreatorEnergy", "studio,bts,fun"));
        draftRepository.save(new Draft(ws, manager, SocialPlatform.LINKEDIN, "Why We Replaced 2-Hour Meetings with 15-Min Coffee Huddles ☕",
                "Long status meetings drain creative energy. Here is the 3-step standup framework our agency uses to ship 2x faster with half the stress.", "productivity,management,culture"));
        draftRepository.save(new Draft(ws, admin, SocialPlatform.X, "5 Morning Habits that Doubled Our Team Reach (Thread) 🧵👇",
                "1. Review top comments before writing copy.\n2. Test hooks on Twitter before filming Reels.\n3. Keep caffeine levels strictly optimized ☕", "growth,tips,creator"));
        draftRepository.save(new Draft(ws, memberSophia, SocialPlatform.INSTAGRAM, "Unveiling the Recycled Packaging Concept 🌿",
                "100% post-consumer recycled paper, soy inks, and zero plastic. Sustainability meets sleek design. What do you think of the matte earthy green finish? 👇 #SustainableDesign #PackagingDesign #EcoFriendly", "design,sustainability"));

        // 8. Calendar Events (Diverse schedule)
        CalendarEvent ce1 = new CalendarEvent();
        ce1.setWorkspace(ws);
        ce1.setUser(manager);
        ce1.setTitle("Live Cold Brew Tasting & Video Shoot ☕🎥");
        ce1.setEventType(EventType.MEETING);
        ce1.setStartTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0));
        ce1.setEndTime(LocalDateTime.now().plusDays(1).withHour(11).withMinute(30));
        ce1.setColor("#6366f1");
        calendarRepository.save(ce1);

        CalendarEvent ce2 = new CalendarEvent();
        ce2.setWorkspace(ws);
        ce2.setUser(memberLeo);
        ce2.setTitle("Summer Collection Official Drop Day! 🚀🎉");
        ce2.setEventType(EventType.PROJECT_DEADLINE);
        ce2.setStartTime(LocalDateTime.now().plusDays(14).withHour(18).withMinute(0));
        ce2.setColor("#ef4444");
        calendarRepository.save(ce2);

        CalendarEvent ce3 = new CalendarEvent();
        ce3.setWorkspace(ws);
        ce3.setUser(admin);
        ce3.setTitle("Weekly Content Brainstorming & Pizza 🍕");
        ce3.setEventType(EventType.MEETING);
        ce3.setStartTime(LocalDateTime.now().plusDays(4).withHour(14).withMinute(0));
        ce3.setEndTime(LocalDateTime.now().plusDays(4).withHour(15).withMinute(30));
        ce3.setColor("#10b981");
        calendarRepository.save(ce3);

        CalendarEvent ce4 = new CalendarEvent();
        ce4.setWorkspace(ws);
        ce4.setUser(memberSophia);
        ce4.setTitle("Packaging Color Proof Review with Printer 📦");
        ce4.setEventType(EventType.PROJECT_DEADLINE);
        ce4.setStartTime(LocalDateTime.now().plusDays(3).withHour(13).withMinute(0));
        ce4.setEndTime(LocalDateTime.now().plusDays(3).withHour(14).withMinute(30));
        ce4.setColor("#f59e0b");
        calendarRepository.save(ce4);

        CalendarEvent ce5 = new CalendarEvent();
        ce5.setWorkspace(ws);
        ce5.setUser(memberMarcus);
        ce5.setTitle("PR Box Courier Pickup & Dispatch 🚚");
        ce5.setEventType(EventType.CUSTOM);
        ce5.setStartTime(LocalDateTime.now().plusDays(6).withHour(11).withMinute(0));
        ce5.setEndTime(LocalDateTime.now().plusDays(6).withHour(12).withMinute(0));
        ce5.setColor("#8b5cf6");
        calendarRepository.save(ce5);

        // 9. Real Activity Logs for Dashboard Timeline
        activityLogRepository.save(new ActivityLog(ws, memberLeo, "TASK_COMPLETED", "TASK", 1L, "IN_PROGRESS", "Record 30-sec coffee brewing Reel ☕"));
        activityLogRepository.save(new ActivityLog(ws, memberSophia, "TASK_COMPLETED", "TASK", 8L, "IN_PROGRESS", "Order branded biodegradable cups & cup sleeves ☕"));
        activityLogRepository.save(new ActivityLog(ws, manager, "STATUS_CHANGE", "PROJECT", p1.getId(), "PLANNING", "Summer Product Drop ☀️🎒 marked ACTIVE (75%)"));
        activityLogRepository.save(new ActivityLog(ws, memberElena, "POST_SCHEDULED", "SOCIAL_POST", 4L, "DRAFT", "LinkedIn Post queued for Thursday 9:30 AM"));
        activityLogRepository.save(new ActivityLog(ws, memberMarcus, "TASK_COMPLETED", "TASK", 17L, "TODO", "Collected shipping addresses from 25 creators 📋"));
        activityLogRepository.save(new ActivityLog(ws, admin, "PROJECT_CREATED", "PROJECT", p6.getId(), null, "Created new initiative: Podcast Launch: 'Behind the Brew' 🎙️"));
        activityLogRepository.save(new ActivityLog(ws, memberLeo, "CONTENT_PUBLISHED", "SOCIAL_POST", 3L, "SCHEDULED", "Morning Routine Bliss Reel published on Instagram"));

        // 10. Notifications
        notificationRepository.save(new Notification(admin, "Welcome to BrightSpark Agency", "Your creative agency workspace is all set up and fully synchronized.", NotificationCategory.SYSTEM, "/dashboard"));
        notificationRepository.save(new Notification(memberLeo, "New Task Assigned ☕", "Alex Mercer assigned you: Record 30-sec coffee brewing Reel", NotificationCategory.TASK, "/tasks"));
        notificationRepository.save(new Notification(manager, "Summer Launch Milestone Reached! 🚀", "Summer Product Drop has reached 75% progress. Team velocity is optimal.", NotificationCategory.PROJECT, "/projects"));
        notificationRepository.save(new Notification(memberSophia, "Asset Review Requested 🎨", "Maya Lin submitted feedback on the giveaway Canva slides.", NotificationCategory.TASK, "/tasks"));
        notificationRepository.save(new Notification(memberMarcus, "PR Dispatch Scheduled 📦", "25 Gifting boxes scheduled for courier pickup next Tuesday.", NotificationCategory.PROJECT, "/projects"));

        // 11. Workflow Automation Rules
        workflowRuleRepository.save(new WorkflowRule(ws, "Celebrate on Task Completion 🎉", "TASK_COMPLETED", "{}", "NOTIFY_TEAM", "{}", true));
        workflowRuleRepository.save(new WorkflowRule(ws, "Alert Manager on New Content Draft 🎨", "DRAFT_CREATED", "{}", "NOTIFY_MANAGER", "{}", true));
        workflowRuleRepository.save(new WorkflowRule(ws, "Notify Assignee on Task Assignment 📝", "TASK_ASSIGNED", "{}", "NOTIFY_ASSIGNEE", "{}", true));

        // 12. Run initial Kafka Reliability tests to populate logs & report
        try {
            kafkaEngine.runAutomatedTests("ALL");
        } catch (Exception e) {
            log.warn("Initial Kafka test run completed with note: {}", e.getMessage());
        }

        log.info("WorkSync comprehensive data seeding completed successfully!");
    }

    private void createTask(Project project, User assignee, User creator, String title, String desc, TaskStatus status, TaskPriority priority, int daysDue) {
        Task task = new Task();
        task.setProject(project);
        task.setAssignedTo(assignee);
        task.setCreatedBy(creator);
        task.setTitle(title);
        task.setDescription(desc);
        task.setStatus(status);
        task.setPriority(priority);
        task.setStartDate(LocalDate.now().minusDays(2));
        task.setDueDate(LocalDate.now().plusDays(daysDue));
        taskRepository.save(task);
    }
}
