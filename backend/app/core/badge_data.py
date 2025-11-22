
def get_available_rewards():
    return [
        {
            "version": 1,
            "title": "Beginner Milestones",
            "badges": [
                {"id": 1, "badge": "Seedling", "threshold": 50, "image": "01.png", "rare": True, "description": "A tiny start - awarded when you earn your first 50 eco points."},
                {"id": 2, "badge": "Sapling", "threshold": 100, "image": "02.png", "description": "You've planted the roots: reach 100 points to earn this."},
                {"id": 3, "badge": "Evergreen", "threshold": 200, "image": "03.png", "description": "Consistent contributor - keep going to reach 200 points."},
                {"id": 4, "badge": "Blossom", "threshold": 300, "image": "04.png", "description": "Your actions are blooming - awarded at 300 points."},
            ]
        },
        {
            "version": 2,
            "title": "Explorer Series",
            "badges": [
                {"id": 101, "badge": "Explorer", "threshold": 20, "image": "05.png"},
                {"id": 102, "badge": "Navigator", "threshold": 80, "image": "06.png"},
                {"id": 103, "badge": "Voyager", "threshold": 240, "image": "07.png"}
            ]
        }
    ]
