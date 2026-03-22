"""
Mock Data Seeder for FundMySkill Backend

Run this script to populate the database with sample data.

Usage:
    python seed_data.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timezone, timedelta
from app.services.firebase import get_firestore


def datetime_now():
    return datetime.now(timezone.utc)


def datetime_to_firestore(dt):
    db = get_firestore()
    if db.is_mock:
        return dt.isoformat()
    return dt


def clear_collections(db):
    """Clear existing data."""
    print("Clearing existing data...")
    collections = ["courses", "users", "quizzes", "user_progress"]
    for col_name in collections:
        try:
            docs = list(db.collection(col_name).stream())
            for doc in docs:
                # Delete subcollections for courses
                if col_name == "courses":
                    try:
                        modules = list(db.collection(col_name).document(doc.id).collection("modules").stream())
                        for mod in modules:
                            lectures = list(db.collection(col_name).document(doc.id).collection("modules").document(mod.id).collection("lectures").stream())
                            for lec in lectures:
                                db.collection(col_name).document(doc.id).collection("modules").document(mod.id).collection("lectures").document(lec.id).delete()
                            db.collection(col_name).document(doc.id).collection("modules").document(mod.id).delete()
                    except Exception:
                        pass
                db.collection(col_name).document(doc.id).delete()
            print(f"  Cleared {col_name}")
        except Exception as e:
            print(f"  Could not clear {col_name}: {e}")


def seed_users(db):
    """Seed user profiles."""
    print("Seeding users...")

    users = [
        {"id": "mock-user-1", "data": {"name": "Alex Student", "avatar_url": "https://i.pravatar.cc/150?u=mock-user-1", "bio": "Lifelong learner", "skills": ["Python"], "role": "student", "joined_at": datetime_to_firestore(datetime_now() - timedelta(days=30))}},
    ]

    for user in users:
        db.collection("users").document(user["id"]).set(user["data"])
        print(f"  Created user: {user['data']['name']}")

    print(f"  Total: {len(users)} users")


def seed_courses(db):
    """Seed courses with embedded instructor info."""
    print("Seeding courses...")

    courses = [
        {
            "id": "1",
            "data": {
                "title": "Applied Machine Learning & Neural Networks",
                "description": "A deep dive into tensor operations, backpropagation, and large-scale model deployment architectures.",
                "instructor_name": "Dr. Elena Vance",
                "instructor_bio": "Stanford AI Faculty",
                "instructor_image": "https://i.pravatar.cc/150?u=elena-vance",
                "thumbnail_url": "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
                "category": "Computer Science",
                "level": "Advanced",
                "price": 149.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Machine Learning", "AI", "Deep Learning"],
                "what_you_will_learn": ["Build neural networks", "Deploy ML models", "Master TensorFlow/PyTorch"],
                "requirements": ["Python basics", "Linear algebra"],
                "stats": {"rating": 4.9, "reviews_count": 2400, "enrollment_count": 5600},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=180)),
            },
            "modules": [
                {"id": "mod-1-1", "title": "Foundational Paradigms", "description": "Introduction to ML concepts", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-1-1-1", "title": "History of Computation", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-1-1-2", "title": "Cybernetics Roots", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-1-1-3", "title": "Neural Foundations", "duration": "45 MIN", "order_index": 3},
                    {"id": "lec-1-1-4", "title": "Ethics of Autonomy", "duration": "45 MIN", "order_index": 4},
                ]},
                {"id": "mod-1-2", "title": "Deep Learning Basics", "description": "Neural network architectures", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-1-2-1", "title": "Perceptrons & MLPs", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-1-2-2", "title": "Backpropagation", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-1-2-3", "title": "Activation Functions", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-1-2-4", "title": "Optimization Algorithms", "duration": "50 MIN", "order_index": 4},
                ]},
                {"id": "mod-1-3", "title": "Convolutional Networks", "description": "Image processing with CNNs", "order_index": 3, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-1-3-1", "title": "Convolution Operations", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-1-3-2", "title": "Pooling Layers", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-1-3-3", "title": "Image Classification", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-1-3-4", "title": "Transfer Learning", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "2",
            "data": {
                "title": "Principles of Generative Urban Design",
                "description": "Exploring how algorithmic logic and procedural generation can revitalize urban living spaces.",
                "instructor_name": "Julian Thorne",
                "instructor_bio": "RIBA Gold Medalist",
                "instructor_image": "https://i.pravatar.cc/150?u=julian-thorne",
                "thumbnail_url": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
                "category": "Architecture",
                "level": "Intermediate",
                "price": 199.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Architecture", "Urban Design", "Generative Design"],
                "what_you_will_learn": ["Parametric design", "GIS integration", "Sustainable planning"],
                "requirements": ["CAD basics", "Design principles"],
                "stats": {"rating": 4.8, "reviews_count": 812, "enrollment_count": 2100},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=120)),
            },
            "modules": [
                {"id": "mod-2-1", "title": "Parametric Foundations", "description": "Algorithmic design thinking", "order_index": 1, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-2-1-1", "title": "Introduction to Parametric Design", "duration": "60 MIN", "order_index": 1},
                    {"id": "lec-2-1-2", "title": "Grasshopper Basics", "duration": "60 MIN", "order_index": 2},
                    {"id": "lec-2-1-3", "title": "Data-Driven Design", "duration": "60 MIN", "order_index": 3},
                ]},
                {"id": "mod-2-2", "title": "Environmental Mapping", "description": "Using GIS data", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-2-2-1", "title": "GIS Integration", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-2-2-2", "title": "Climate Analysis", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-2-2-3", "title": "Site Optimization", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "3",
            "data": {
                "title": "Ethics of the Anthropocene",
                "description": "Navigating the moral landscape of a human-centric era. A philosophical study on global responsibility.",
                "instructor_name": "Dr. Aris Thorne",
                "instructor_bio": "Cambridge Philosophy Fellow",
                "instructor_image": "https://i.pravatar.cc/150?u=aris-thorne",
                "thumbnail_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
                "category": "Philosophy",
                "level": "Beginner",
                "price": 89.00,
                "status": "published",
                "duration_string": "6 Weeks",
                "tags": ["Philosophy", "Ethics", "Environment"],
                "what_you_will_learn": ["Ethical frameworks", "Climate ethics", "Global responsibility"],
                "requirements": ["Open mind", "Interest in philosophy"],
                "stats": {"rating": 5.0, "reviews_count": 430, "enrollment_count": 1200},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=90)),
            },
            "modules": [
                {"id": "mod-3-1", "title": "Introduction to Anthropocene", "description": "Defining the era", "order_index": 1, "total_duration": "2 hrs",
                 "lectures": [
                    {"id": "lec-3-1-1", "title": "What is the Anthropocene?", "duration": "40 MIN", "order_index": 1},
                    {"id": "lec-3-1-2", "title": "Historical Context", "duration": "40 MIN", "order_index": 2},
                    {"id": "lec-3-1-3", "title": "Ethical Implications", "duration": "40 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "4",
            "data": {
                "title": "Data Science & Analytics Fundamentals",
                "description": "Master data analysis, visualization, and statistical modeling using Python and modern tools.",
                "instructor_name": "Dr. Sarah Chen",
                "instructor_bio": "MIT Data Science Professor",
                "instructor_image": "https://i.pravatar.cc/150?u=sarah-chen",
                "thumbnail_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
                "category": "Data Science",
                "level": "Intermediate",
                "price": 129.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Data Science", "Python", "Statistics"],
                "what_you_will_learn": ["Python for data", "Visualization", "Statistical modeling"],
                "requirements": ["Basic Python", "Math fundamentals"],
                "stats": {"rating": 4.7, "reviews_count": 1850, "enrollment_count": 4200},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=150)),
            },
            "modules": [
                {"id": "mod-4-1", "title": "Python for Data Science", "description": "Essential tools", "order_index": 1, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-4-1-1", "title": "NumPy Fundamentals", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-4-1-2", "title": "Pandas DataFrames", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-4-1-3", "title": "Data Cleaning", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-4-1-4", "title": "Exploratory Analysis", "duration": "50 MIN", "order_index": 4},
                ]},
                {"id": "mod-4-2", "title": "Data Visualization", "description": "Creating insights", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-4-2-1", "title": "Matplotlib Essentials", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-4-2-2", "title": "Seaborn for Stats", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-4-2-3", "title": "Interactive Plotly", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "5",
            "data": {
                "title": "Full-Stack Web Development",
                "description": "Build modern web applications with React, Node.js, and MongoDB from scratch.",
                "instructor_name": "Marcus Johnson",
                "instructor_bio": "Senior Developer at Google",
                "instructor_image": "https://i.pravatar.cc/150?u=marcus-johnson",
                "thumbnail_url": "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800",
                "category": "Web Development",
                "level": "Intermediate",
                "price": 179.00,
                "status": "published",
                "duration_string": "12 Weeks",
                "tags": ["React", "Node.js", "MongoDB", "JavaScript"],
                "what_you_will_learn": ["React development", "RESTful APIs", "Database design"],
                "requirements": ["HTML/CSS", "JavaScript basics"],
                "stats": {"rating": 4.9, "reviews_count": 3200, "enrollment_count": 7500},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=200)),
            },
            "modules": [
                {"id": "mod-5-1", "title": "React Fundamentals", "description": "Modern frontend", "order_index": 1, "total_duration": "5 hrs",
                 "lectures": [
                    {"id": "lec-5-1-1", "title": "Components & Props", "duration": "60 MIN", "order_index": 1},
                    {"id": "lec-5-1-2", "title": "State Management", "duration": "60 MIN", "order_index": 2},
                    {"id": "lec-5-1-3", "title": "Hooks Deep Dive", "duration": "60 MIN", "order_index": 3},
                    {"id": "lec-5-1-4", "title": "Routing & Navigation", "duration": "60 MIN", "order_index": 4},
                ]},
                {"id": "mod-5-2", "title": "Node.js Backend", "description": "Server-side JS", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-5-2-1", "title": "Express.js Basics", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-5-2-2", "title": "REST API Design", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-5-2-3", "title": "MongoDB Integration", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-5-2-4", "title": "Authentication", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "6",
            "data": {
                "title": "Cybersecurity Fundamentals",
                "description": "Learn to protect systems from cyber threats with ethical hacking and security protocols.",
                "instructor_name": "Dr. Rachel Kim",
                "instructor_bio": "IBM Security Researcher",
                "instructor_image": "https://i.pravatar.cc/150?u=rachel-kim",
                "thumbnail_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
                "category": "Cybersecurity",
                "level": "Intermediate",
                "price": 199.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Cybersecurity", "Ethical Hacking", "Network Security"],
                "what_you_will_learn": ["Threat analysis", "Penetration testing", "Security protocols"],
                "requirements": ["Networking basics", "Linux familiarity"],
                "stats": {"rating": 4.8, "reviews_count": 1200, "enrollment_count": 3100},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=140)),
            },
            "modules": [
                {"id": "mod-6-1", "title": "Security Fundamentals", "description": "Core concepts", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-6-1-1", "title": "Threat Landscape", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-6-1-2", "title": "Attack Vectors", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-6-1-3", "title": "Defense Strategies", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-6-2", "title": "Ethical Hacking", "description": "Penetration testing", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-6-2-1", "title": "Reconnaissance", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-6-2-2", "title": "Vulnerability Scanning", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-6-2-3", "title": "Exploitation", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-6-2-4", "title": "Post-Exploitation", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "7",
            "data": {
                "title": "Blockchain & Smart Contracts",
                "description": "Build decentralized apps and smart contracts on Ethereum with Solidity.",
                "instructor_name": "Vitalik Naomi",
                "instructor_bio": "Blockchain Developer",
                "instructor_image": "https://i.pravatar.cc/150?u=vitalik-naomi",
                "thumbnail_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
                "category": "Blockchain",
                "level": "Advanced",
                "price": 249.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Blockchain", "Ethereum", "Solidity", "Web3"],
                "what_you_will_learn": ["Smart contracts", "DeFi protocols", "dApp development"],
                "requirements": ["JavaScript", "Basic cryptography"],
                "stats": {"rating": 4.6, "reviews_count": 890, "enrollment_count": 2400},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=100)),
            },
            "modules": [
                {"id": "mod-7-1", "title": "Blockchain Basics", "description": "Core concepts", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-7-1-1", "title": "What is Blockchain?", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-7-1-2", "title": "Consensus Mechanisms", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-7-1-3", "title": "Ethereum Deep Dive", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-7-2", "title": "Solidity Programming", "description": "Smart contracts", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-7-2-1", "title": "Solidity Syntax", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-7-2-2", "title": "Contract Patterns", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-7-2-3", "title": "Security Best Practices", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-7-2-4", "title": "Testing & Deployment", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "8",
            "data": {
                "title": "Digital Marketing Mastery",
                "description": "Comprehensive guide to SEO, social media, content marketing, and paid advertising.",
                "instructor_name": "Emily Rodriguez",
                "instructor_bio": "HubSpot Marketing Director",
                "instructor_image": "https://i.pravatar.cc/150?u=emily-rodriguez",
                "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
                "category": "Marketing",
                "level": "Beginner",
                "price": 99.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Digital Marketing", "SEO", "Social Media"],
                "what_you_will_learn": ["SEO optimization", "Social campaigns", "Analytics"],
                "requirements": ["No prerequisites"],
                "stats": {"rating": 4.7, "reviews_count": 2100, "enrollment_count": 5800},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=130)),
            },
            "modules": [
                {"id": "mod-8-1", "title": "Marketing Foundations", "description": "Core concepts", "order_index": 1, "total_duration": "2 hrs",
                 "lectures": [
                    {"id": "lec-8-1-1", "title": "Digital Landscape", "duration": "40 MIN", "order_index": 1},
                    {"id": "lec-8-1-2", "title": "Customer Journey", "duration": "40 MIN", "order_index": 2},
                    {"id": "lec-8-1-3", "title": "Strategy Building", "duration": "40 MIN", "order_index": 3},
                ]},
                {"id": "mod-8-2", "title": "SEO Mastery", "description": "Search optimization", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-8-2-1", "title": "On-Page SEO", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-8-2-2", "title": "Technical SEO", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-8-2-3", "title": "Link Building", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "9",
            "data": {
                "title": "Personal Finance & Investing",
                "description": "Take control of your financial future with investment strategies and wealth building.",
                "instructor_name": "Prof. Michael Torres",
                "instructor_bio": "Harvard Economics Faculty",
                "instructor_image": "https://i.pravatar.cc/150?u=michael-torres",
                "thumbnail_url": "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800",
                "category": "Finance",
                "level": "Beginner",
                "price": 119.00,
                "status": "published",
                "duration_string": "6 Weeks",
                "tags": ["Finance", "Investing", "Stocks"],
                "what_you_will_learn": ["Portfolio management", "Stock analysis", "Risk management"],
                "requirements": ["Basic math"],
                "stats": {"rating": 4.8, "reviews_count": 1650, "enrollment_count": 4100},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=160)),
            },
            "modules": [
                {"id": "mod-9-1", "title": "Financial Foundations", "description": "Money basics", "order_index": 1, "total_duration": "2 hrs",
                 "lectures": [
                    {"id": "lec-9-1-1", "title": "Money Fundamentals", "duration": "40 MIN", "order_index": 1},
                    {"id": "lec-9-1-2", "title": "Market Mechanics", "duration": "40 MIN", "order_index": 2},
                    {"id": "lec-9-1-3", "title": "Risk & Return", "duration": "40 MIN", "order_index": 3},
                ]},
                {"id": "mod-9-2", "title": "Investment Strategies", "description": "Building wealth", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-9-2-1", "title": "Asset Classes", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-9-2-2", "title": "Diversification", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-9-2-3", "title": "Long-term Investing", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "10",
            "data": {
                "title": "Psychology & Human Behavior",
                "description": "Explore the human mind, cognitive processes, emotions, and social dynamics.",
                "instructor_name": "Dr. Lisa Park",
                "instructor_bio": "Clinical Psychologist",
                "instructor_image": "https://i.pravatar.cc/150?u=lisa-park",
                "thumbnail_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
                "category": "Psychology",
                "level": "Beginner",
                "price": 79.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Psychology", "Behavior", "Cognitive Science"],
                "what_you_will_learn": ["Psychological theories", "Behavior analysis", "Cognitive biases"],
                "requirements": ["Curiosity"],
                "stats": {"rating": 4.9, "reviews_count": 980, "enrollment_count": 2800},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=110)),
            },
            "modules": [
                {"id": "mod-10-1", "title": "Psychology Foundations", "description": "Core concepts", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-10-1-1", "title": "History of Psychology", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-10-1-2", "title": "Research Methods", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-10-1-3", "title": "Brain & Behavior", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-10-2", "title": "Cognitive Psychology", "description": "Mental processes", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-10-2-1", "title": "Memory Systems", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-10-2-2", "title": "Decision Making", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-10-2-3", "title": "Attention & Perception", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "11",
            "data": {
                "title": "Calculus & Linear Algebra",
                "description": "Master mathematical foundations for machine learning and engineering.",
                "instructor_name": "Prof. David Williams",
                "instructor_bio": "Princeton Mathematics",
                "instructor_image": "https://i.pravatar.cc/150?u=david-williams",
                "thumbnail_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800",
                "category": "Mathematics",
                "level": "Intermediate",
                "price": 109.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Mathematics", "Calculus", "Linear Algebra"],
                "what_you_will_learn": ["Derivatives", "Matrices", "ML math foundations"],
                "requirements": ["High school algebra"],
                "stats": {"rating": 4.6, "reviews_count": 720, "enrollment_count": 1900},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=170)),
            },
            "modules": [
                {"id": "mod-11-1", "title": "Calculus Foundations", "description": "Differential calculus", "order_index": 1, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-11-1-1", "title": "Limits & Continuity", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-11-1-2", "title": "Derivatives", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-11-1-3", "title": "Integration", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-11-1-4", "title": "Multivariable Calculus", "duration": "50 MIN", "order_index": 4},
                ]},
                {"id": "mod-11-2", "title": "Linear Algebra", "description": "Vectors & matrices", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-11-2-1", "title": "Vectors & Spaces", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-11-2-2", "title": "Matrix Operations", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-11-2-3", "title": "Eigenvalues", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-11-2-4", "title": "ML Applications", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "12",
            "data": {
                "title": "Graphic Design & Visual Communication",
                "description": "Learn professional design with Adobe Creative Suite for digital and print.",
                "instructor_name": "Isabella Martinez",
                "instructor_bio": "Award-winning Designer",
                "instructor_image": "https://i.pravatar.cc/150?u=isabella-martinez",
                "thumbnail_url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
                "category": "Design",
                "level": "Beginner",
                "price": 139.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Graphic Design", "Adobe", "UI/UX"],
                "what_you_will_learn": ["Photoshop", "Illustrator", "Design principles"],
                "requirements": ["Creative mindset"],
                "stats": {"rating": 4.8, "reviews_count": 1450, "enrollment_count": 3600},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=95)),
            },
            "modules": [
                {"id": "mod-12-1", "title": "Design Fundamentals", "description": "Core principles", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-12-1-1", "title": "Color Theory", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-12-1-2", "title": "Typography", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-12-1-3", "title": "Layout & Composition", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-12-2", "title": "Adobe Mastery", "description": "Professional tools", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-12-2-1", "title": "Photoshop Essentials", "duration": "60 MIN", "order_index": 1},
                    {"id": "lec-12-2-2", "title": "Illustrator Deep Dive", "duration": "60 MIN", "order_index": 2},
                    {"id": "lec-12-2-3", "title": "InDesign for Print", "duration": "60 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "13",
            "data": {
                "title": "Music Production & Audio",
                "description": "Create professional music from your home studio with mixing and mastering.",
                "instructor_name": "James Wilson",
                "instructor_bio": "Grammy-nominated Producer",
                "instructor_image": "https://i.pravatar.cc/150?u=james-wilson",
                "thumbnail_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
                "category": "Music",
                "level": "Intermediate",
                "price": 169.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Music Production", "Mixing", "Mastering"],
                "what_you_will_learn": ["DAW workflows", "Mixing techniques", "Sound design"],
                "requirements": ["Basic music theory"],
                "stats": {"rating": 4.7, "reviews_count": 680, "enrollment_count": 1800},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=125)),
            },
            "modules": [
                {"id": "mod-13-1", "title": "Production Basics", "description": "Getting started", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-13-1-1", "title": "Studio Setup", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-13-1-2", "title": "DAW Navigation", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-13-1-3", "title": "Sound Design", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-13-2", "title": "Mixing Techniques", "description": "Professional mixing", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-13-2-1", "title": "EQ & Compression", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-13-2-2", "title": "Spatial Effects", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-13-2-3", "title": "Automation", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-13-2-4", "title": "Mix Bus Processing", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "14",
            "data": {
                "title": "Photography Masterclass",
                "description": "From camera basics to advanced techniques. Master composition and lighting.",
                "instructor_name": "Anna Kowalski",
                "instructor_bio": "National Geographic",
                "instructor_image": "https://i.pravatar.cc/150?u=anna-kowalski",
                "thumbnail_url": "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800",
                "category": "Photography",
                "level": "Beginner",
                "price": 129.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Photography", "Composition", "Lightroom"],
                "what_you_will_learn": ["Camera settings", "Composition", "Post-processing"],
                "requirements": ["Camera access"],
                "stats": {"rating": 4.9, "reviews_count": 1100, "enrollment_count": 2900},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=145)),
            },
            "modules": [
                {"id": "mod-14-1", "title": "Camera Fundamentals", "description": "Understanding gear", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-14-1-1", "title": "Exposure Triangle", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-14-1-2", "title": "Lenses & Focal Length", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-14-1-3", "title": "Focus Systems", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-14-2", "title": "Composition Mastery", "description": "Visual storytelling", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-14-2-1", "title": "Rule of Thirds", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-14-2-2", "title": "Leading Lines", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-14-2-3", "title": "Light & Shadow", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
        {
            "id": "15",
            "data": {
                "title": "AWS Cloud Architecture",
                "description": "Design scalable cloud infrastructure with DevOps practices and automation.",
                "instructor_name": "Robert Chang",
                "instructor_bio": "AWS Solutions Architect",
                "instructor_image": "https://i.pravatar.cc/150?u=robert-chang",
                "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
                "category": "Cloud Computing",
                "level": "Advanced",
                "price": 229.00,
                "status": "published",
                "duration_string": "12 Weeks",
                "tags": ["AWS", "DevOps", "Cloud"],
                "what_you_will_learn": ["Cloud architecture", "CI/CD", "Kubernetes"],
                "requirements": ["Linux basics", "Networking"],
                "stats": {"rating": 4.8, "reviews_count": 920, "enrollment_count": 2200},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=85)),
            },
            "modules": [
                {"id": "mod-15-1", "title": "AWS Foundations", "description": "Core services", "order_index": 1, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-15-1-1", "title": "AWS Overview", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-15-1-2", "title": "EC2 & Compute", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-15-1-3", "title": "S3 & Storage", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-15-1-4", "title": "VPC & Networking", "duration": "50 MIN", "order_index": 4},
                ]},
                {"id": "mod-15-2", "title": "DevOps on AWS", "description": "Automation", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-15-2-1", "title": "Infrastructure as Code", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-15-2-2", "title": "CI/CD Pipelines", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-15-2-3", "title": "Docker & ECS", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-15-2-4", "title": "Kubernetes on EKS", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "16",
            "data": {
                "title": "Mobile App Development",
                "description": "Build native iOS and Android apps with Swift and Kotlin.",
                "instructor_name": "Sofia Ahmed",
                "instructor_bio": "Apple Developer",
                "instructor_image": "https://i.pravatar.cc/150?u=sofia-ahmed",
                "thumbnail_url": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
                "category": "Mobile Development",
                "level": "Intermediate",
                "price": 189.00,
                "status": "published",
                "duration_string": "14 Weeks",
                "tags": ["iOS", "Android", "Swift", "Kotlin"],
                "what_you_will_learn": ["Swift", "Kotlin", "App Store publishing"],
                "requirements": ["Programming basics"],
                "stats": {"rating": 4.7, "reviews_count": 1350, "enrollment_count": 3400},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=115)),
            },
            "modules": [
                {"id": "mod-16-1", "title": "iOS with Swift", "description": "Apple development", "order_index": 1, "total_duration": "5 hrs",
                 "lectures": [
                    {"id": "lec-16-1-1", "title": "Swift Basics", "duration": "60 MIN", "order_index": 1},
                    {"id": "lec-16-1-2", "title": "UIKit Fundamentals", "duration": "60 MIN", "order_index": 2},
                    {"id": "lec-16-1-3", "title": "SwiftUI Intro", "duration": "60 MIN", "order_index": 3},
                    {"id": "lec-16-1-4", "title": "Data Persistence", "duration": "60 MIN", "order_index": 4},
                ]},
                {"id": "mod-16-2", "title": "Android with Kotlin", "description": "Google development", "order_index": 2, "total_duration": "5 hrs",
                 "lectures": [
                    {"id": "lec-16-2-1", "title": "Kotlin Basics", "duration": "60 MIN", "order_index": 1},
                    {"id": "lec-16-2-2", "title": "Android Studio", "duration": "60 MIN", "order_index": 2},
                    {"id": "lec-16-2-3", "title": "Jetpack Compose", "duration": "60 MIN", "order_index": 3},
                    {"id": "lec-16-2-4", "title": "Room Database", "duration": "60 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "17",
            "data": {
                "title": "Game Development with Unreal",
                "description": "Create professional 3D games with Unreal Engine and C++.",
                "instructor_name": "Kevin O'Brien",
                "instructor_bio": "Epic Games Developer",
                "instructor_image": "https://i.pravatar.cc/150?u=kevin-obrien",
                "thumbnail_url": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
                "category": "Game Development",
                "level": "Intermediate",
                "price": 199.00,
                "status": "published",
                "duration_string": "12 Weeks",
                "tags": ["Unreal Engine", "C++", "Game Dev"],
                "what_you_will_learn": ["Blueprints", "C++ gameplay", "Level design"],
                "requirements": ["C++ basics"],
                "stats": {"rating": 4.8, "reviews_count": 750, "enrollment_count": 2000},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=105)),
            },
            "modules": [
                {"id": "mod-17-1", "title": "Unreal Basics", "description": "Engine overview", "order_index": 1, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-17-1-1", "title": "Editor Overview", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-17-1-2", "title": "Blueprints Intro", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-17-1-3", "title": "Materials & Lighting", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-17-1-4", "title": "Level Design", "duration": "50 MIN", "order_index": 4},
                ]},
                {"id": "mod-17-2", "title": "C++ for Unreal", "description": "Programming", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-17-2-1", "title": "C++ Classes", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-17-2-2", "title": "Actors & Components", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-17-2-3", "title": "Input & Movement", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-17-2-4", "title": "AI Navigation", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "18",
            "data": {
                "title": "Bioinformatics & Genomics",
                "description": "Analyze biological data with computational methods and Python.",
                "instructor_name": "Dr. Priya Sharma",
                "instructor_bio": "Stanford Bioinformatics",
                "instructor_image": "https://i.pravatar.cc/150?u=priya-sharma",
                "thumbnail_url": "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800",
                "category": "Biology",
                "level": "Advanced",
                "price": 179.00,
                "status": "published",
                "duration_string": "10 Weeks",
                "tags": ["Bioinformatics", "Genomics", "Python"],
                "what_you_will_learn": ["Sequence analysis", "Gene expression", "ML in biology"],
                "requirements": ["Biology basics", "Python"],
                "stats": {"rating": 4.6, "reviews_count": 420, "enrollment_count": 1100},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=135)),
            },
            "modules": [
                {"id": "mod-18-1", "title": "Bioinformatics Intro", "description": "Fundamentals", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-18-1-1", "title": "What is Bioinformatics?", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-18-1-2", "title": "Biological Databases", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-18-1-3", "title": "Sequence Analysis", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-18-2", "title": "Genomic Analysis", "description": "Working with data", "order_index": 2, "total_duration": "4 hrs",
                 "lectures": [
                    {"id": "lec-18-2-1", "title": "DNA Sequencing", "duration": "50 MIN", "order_index": 1},
                    {"id": "lec-18-2-2", "title": "Alignment Algorithms", "duration": "50 MIN", "order_index": 2},
                    {"id": "lec-18-2-3", "title": "Gene Expression", "duration": "50 MIN", "order_index": 3},
                    {"id": "lec-18-2-4", "title": "Variant Calling", "duration": "50 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "19",
            "data": {
                "title": "Agile Project Management",
                "description": "Master Scrum and Agile methodologies for effective team leadership.",
                "instructor_name": "Thomas Anderson",
                "instructor_bio": "PMP Certified",
                "instructor_image": "https://i.pravatar.cc/150?u=thomas-anderson",
                "thumbnail_url": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
                "category": "Business",
                "level": "Intermediate",
                "price": 149.00,
                "status": "published",
                "duration_string": "6 Weeks",
                "tags": ["Agile", "Scrum", "Project Management"],
                "what_you_will_learn": ["Scrum ceremonies", "Backlog management", "Team leadership"],
                "requirements": ["Work experience"],
                "stats": {"rating": 4.7, "reviews_count": 1280, "enrollment_count": 3200},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=155)),
            },
            "modules": [
                {"id": "mod-19-1", "title": "Agile Fundamentals", "description": "Core concepts", "order_index": 1, "total_duration": "2 hrs",
                 "lectures": [
                    {"id": "lec-19-1-1", "title": "Agile Manifesto", "duration": "40 MIN", "order_index": 1},
                    {"id": "lec-19-1-2", "title": "Agile vs Traditional", "duration": "40 MIN", "order_index": 2},
                    {"id": "lec-19-1-3", "title": "Choosing Methodology", "duration": "40 MIN", "order_index": 3},
                ]},
                {"id": "mod-19-2", "title": "Scrum Framework", "description": "Implementation", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-19-2-1", "title": "Scrum Roles", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-19-2-2", "title": "Sprint Planning", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-19-2-3", "title": "Daily Standups", "duration": "45 MIN", "order_index": 3},
                    {"id": "lec-19-2-4", "title": "Retrospectives", "duration": "45 MIN", "order_index": 4},
                ]},
            ],
        },
        {
            "id": "20",
            "data": {
                "title": "Creative Writing & Storytelling",
                "description": "Develop compelling narratives from short fiction to novels.",
                "instructor_name": "Catherine Blake",
                "instructor_bio": "Bestselling Author",
                "instructor_image": "https://i.pravatar.cc/150?u=catherine-blake",
                "thumbnail_url": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
                "category": "Writing",
                "level": "Beginner",
                "price": 89.00,
                "status": "published",
                "duration_string": "8 Weeks",
                "tags": ["Writing", "Storytelling", "Fiction"],
                "what_you_will_learn": ["Character development", "Plot structure", "Dialogue"],
                "requirements": ["English proficiency"],
                "stats": {"rating": 4.9, "reviews_count": 890, "enrollment_count": 2400},
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=175)),
            },
            "modules": [
                {"id": "mod-20-1", "title": "Story Foundations", "description": "Building blocks", "order_index": 1, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-20-1-1", "title": "Elements of Story", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-20-1-2", "title": "Character Development", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-20-1-3", "title": "Plot Structure", "duration": "45 MIN", "order_index": 3},
                ]},
                {"id": "mod-20-2", "title": "Writing Craft", "description": "Techniques", "order_index": 2, "total_duration": "3 hrs",
                 "lectures": [
                    {"id": "lec-20-2-1", "title": "Show Don't Tell", "duration": "45 MIN", "order_index": 1},
                    {"id": "lec-20-2-2", "title": "Dialogue Mastery", "duration": "45 MIN", "order_index": 2},
                    {"id": "lec-20-2-3", "title": "Editing Your Work", "duration": "45 MIN", "order_index": 3},
                ]},
            ],
        },
    ]

    for course in courses:
        db.collection("courses").document(course["id"]).set(course["data"])
        print(f"  Created course: {course['data']['title']}")

        for module in course.get("modules", []):
            module_data = {
                "title": module["title"],
                "description": module["description"],
                "order_index": module["order_index"],
                "total_duration": module["total_duration"],
            }
            db.collection("courses").document(course["id"]).collection("modules").document(module["id"]).set(module_data)

            for lecture in module.get("lectures", []):
                lecture_data = {
                    "title": lecture["title"],
                    "duration": lecture["duration"],
                    "order_index": lecture["order_index"],
                    "video_url": f"https://example.com/videos/{lecture['id']}.mp4",
                    "description": f"Learn about {lecture['title']}.",
                }
                db.collection("courses").document(course["id"]).collection("modules").document(module["id"]).collection("lectures").document(lecture["id"]).set(lecture_data)

    print(f"  Total: {len(courses)} courses")


def seed_quizzes(db):
    """Seed quizzes."""
    print("Seeding quizzes...")

    quizzes = [
        {
            "id": "quiz-1-1",
            "data": {
                "context_source": {"type": "module", "id": "mod-1-1"},
                "title": "Foundational Paradigms Quiz",
                "time_limit_seconds": 900,
                "questions": [
                    {"id": "q1", "text": "What is backpropagation?", "points": 2, "options": [
                        {"letter": "A", "text": "A gradient descent algorithm", "is_correct": True},
                        {"letter": "B", "text": "A type of neural network", "is_correct": False},
                        {"letter": "C", "text": "A data structure", "is_correct": False},
                    ], "immediate_feedback": "Backpropagation is an algorithm for calculating gradients."},
                ],
                "created_at": datetime_to_firestore(datetime_now() - timedelta(days=30)),
            },
        },
    ]

    for quiz in quizzes:
        db.collection("quizzes").document(quiz["id"]).set(quiz["data"])
        print(f"  Created quiz: {quiz['data']['title']}")

    print(f"  Total: {len(quizzes)} quizzes")


def main():
    print("=" * 50)
    print("FundMySkill Data Seeder")
    print("=" * 50)

    db = get_firestore()
    print(f"Database: {'Mock' if db.is_mock else 'Firebase'}")
    print()

    clear_collections(db.db)
    print()

    seed_users(db.db)
    print()

    seed_courses(db.db)
    print()

    seed_quizzes(db.db)
    print()

    print("=" * 50)
    print("Seeding complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
