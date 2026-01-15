import sys
import os
import random
from datetime import datetime

# Add the parent directory to the Python path so we can import DB modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from DB.forum_manager import create_post_db, create_user_profile_db
from DB.firebase_config import db

def seed_database():
    print("Starting database seed...")

    # Create a few dummy users to be authors
    users = [
        {"uid": "user_farmer_john", "username": "FarmerJohn", "email": "john@example.com", "bio": "3rd generation corn farmer."},
        {"uid": "user_alice_tech", "username": "AliceAgTech", "email": "alice@example.com", "bio": "Precision agriculture specialist."},
        {"uid": "user_bob_organic", "username": "OrganicBob", "email": "bob@example.com", "bio": "Passionate about sustainable farming."},
        {"uid": "user_sarah_vet", "username": "SarahVet", "email": "sarah@example.com", "bio": "Livestock veterinarian."}
    ]

    for user in users:
        try:
            # Check if user exists first to avoid overwrite if we want (or just overwrite/ignore)
            # create_user_profile_db uses set() so it acts as upsert/overwrite
            create_user_profile_db(user['uid'], user['username'], user['email'], user['bio'])
            print(f"Created/Updated user: {user['username']}")
        except Exception as e:
            print(f"Error creating user {user['username']}: {e}")

    # Dummy Posts Data
    # Categories: Crops, Livestock, Machinery, Organic, Market, Government, Events, General
    dummy_posts = [
        # Crops & Soil
        {
            "title": "Best cover crops for nitrogen fixation?",
            "content": "I'm looking to improve my soil health before the next corn planting season. What cover crops have you had the best success with for fixing nitrogen in Zone 5?",
            "category": "Crops",
            "author_idx": 2 # Bob
        },
        {
            "title": "Fighting corn rootworm resistance",
            "content": "We're seeing some signs of resistance in our Bt corn fields. Has anyone tried rotating with soybeans and using soil insecticides? What are the best management practices?",
            "category": "Crops",
            "author_idx": 0 # John
        },
        {
            "title": "Soil pH balancing for wheat",
            "content": "My recent soil test came back with a pH of 5.8. How much lime should I be applying per acre to get it optimized for winter wheat?",
            "category": "Crops",
            "author_idx": 0
        },

        # Livestock
        {
            "title": "Calving season preparation checklist",
            "content": "Calving season is just around the corner. I'm putting together a checklist of essentials. I have iodine, colostrum replacer, and chains. What else is a must-have in your kit?",
            "category": "Livestock",
            "author_idx": 3 # Sarah
        },
        {
            "title": "Rotational grazing schedule updates",
            "content": "How often are you moving your herd during the peak growth season? I'm trying to maximize forage utilization without overgrazing.",
            "category": "Livestock",
            "author_idx": 2
        },
        {
            "title": "Treating pinkeye in cattle",
            "content": "We've had a bad outbreak of pinkeye this summer due to the flies and dust. What treatments are proving most effective for you all this year?",
            "category": "Livestock",
            "author_idx": 3
        },

        # Machinery
        {
            "title": "John Deere vs Case IH combine reliability",
            "content": "Looking to upgrade our combine for next harvest. We've been green for years but the local Case dealer has better service. Thoughts on the new axial flow series?",
            "category": "Machinery",
            "author_idx": 0
        },
        {
            "title": "GPS guidance system calibration issues",
            "content": "My autosteer seems to be drifting about 6 inches to the right. Recalibrated the receiver but still no luck. Anyone else having issues with the latest firmware update?",
            "category": "Machinery",
            "author_idx": 1 # Alice
        },
        {
            "title": "Preventative maintenance for planters",
            "content": "Winter is the best time for maintenance. What are the key wear points I should be checking on my 16-row planter before spring?",
            "category": "Machinery",
            "author_idx": 0
        },

        # Organic Farming
        {
            "title": "Organic pest control for tomatoes",
            "content": "Hornworms are decimating my organic tomato crop. I can't use synthetic pesticides. Has anyone had success with BT or introducing beneficial insects like braconid wasps?",
            "category": "Organic",
            "author_idx": 2
        },
        {
            "title": "Certification process hurdles",
            "content": "We're in the transition period to certified organic. The paperwork is overwhelming! Any tips for organizing records for the inspector?",
            "category": "Organic",
            "author_idx": 2
        },

        # Market Prices
        {
            "title": "Soybean futures rallying?",
            "content": "Saw the report on South American weather affecting yields. Do you think we'll see beans hit $14 again this month? Trying to decide whether to sell or hold.",
            "category": "Market",
            "author_idx": 1
        },
        {
            "title": "Fertilizer price outlook 2026",
            "content": "Urea prices seem to be stabilizing, but phosphates remain high. Is anyone pre-buying for spring or waiting to see if prices drop further?",
            "category": "Market",
            "author_idx": 0
        },

        # Government Schemes
        {
            "title": "EQIP grant application tips",
            "content": "Applying for an EQIP grant for a high tunnel. For those who got approved, what specific details did you emphasis in your application?",
            "category": "Government",
            "author_idx": 2
        },
        {
            "title": "New crop insurance subsidies",
            "content": "Did anyone see the new RMA announcement about cover crop subsidies? It looks like we can get a $5/acre premium discount.",
            "category": "Government",
            "author_idx": 1
        },

        # Events
        {
            "title": "National Farm Machinery Show meetup",
            "content": "Who's heading to Louisville for the show next week? Would be great to organize a meetup for forum members at the expo center.",
            "category": "Events",
            "author_idx": 1
        },
        {
            "title": "County Fair dates announced",
            "content": "Just a heads up, the county fair dates have been moved up a week this year. Make sure to get your 4-H entries in early!",
            "category": "Events",
            "author_idx": 3
        },

        # General
        {
            "title": "Farm dog appreciation post",
            "content": "Let's see those hard-working farm dogs! My heeler just turned 10 and still works cattle like a pup.",
            "category": "General",
            "author_idx": 0
        },
        {
            "title": "Morning coffee views",
            "content": "Nothing beats the sunrise over a fresh cut hay field. Hope everyone is having a safe and productive week.",
            "category": "General",
            "author_idx": 2
        }
    ]

    print(f"Creating {len(dummy_posts)} dummy posts...")

    for post in dummy_posts:
        try:
            author = users[post['author_idx']]
            create_post_db(
                author_id=author['uid'],
                title=post['title'],
                content=post['content'],
                category=post['category']
            )
            print(f"Created post: {post['title']} [{post['category']}]")
        except Exception as e:
            print(f"Error creating post '{post['title']}': {e}")
            # If function signature mismatch (e.g. category not accepted yet in cached version?), try without
            try:
                print("Retrying without category...")
                create_post_db(
                    author_id=author['uid'],
                    title=post['title'],
                    content=post['content']
                )
                print(f"Created post (no category): {post['title']}")
            except Exception as e2:
                print(f"Failed retry: {e2}")

    print("Database seeding completed!")

if __name__ == "__main__":
    seed_database()
