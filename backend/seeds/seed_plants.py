import sys
import os
import json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from models import db
from models.plant import Plant, Region


def J(data):
    """Helper: encode Python list/dict to JSON string."""
    return json.dumps(data)


def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # ── Regions ──────────────────────────────────────────────
        tropical = Region(
            name="Tropical",
            description="Hot and humid year-round near the equator. High rainfall and biodiversity.",
            climate="Tropical Rainforest / Monsoon",
            avg_temp_min=20, avg_temp_max=35,
            last_frost_month=None, first_frost_month=None
        )
        subtropical = Region(
            name="Subtropical",
            description="Warm temperatures with distinct wet and dry seasons.",
            climate="Humid/Dry Subtropical",
            avg_temp_min=15, avg_temp_max=30,
            last_frost_month=3, first_frost_month=11
        )
        temperate = Region(
            name="Temperate",
            description="Four distinct seasons with moderate rainfall throughout the year.",
            climate="Oceanic / Continental Temperate",
            avg_temp_min=5, avg_temp_max=25,
            last_frost_month=4, first_frost_month=10
        )
        mediterranean = Region(
            name="Mediterranean",
            description="Hot dry summers and mild wet winters. Coastal climates.",
            climate="Mediterranean",
            avg_temp_min=8, avg_temp_max=28,
            last_frost_month=3, first_frost_month=11
        )
        arid = Region(
            name="Arid / Desert",
            description="Very low rainfall, extreme heat by day and cold by night.",
            climate="Hot Desert / Semi-Arid",
            avg_temp_min=10, avg_temp_max=45,
            last_frost_month=2, first_frost_month=12
        )
        alpine = Region(
            name="Alpine / Arctic",
            description="Very cold temperatures, short growing seasons, frost possible year-round.",
            climate="Alpine / Tundra",
            avg_temp_min=-10, avg_temp_max=15,
            last_frost_month=6, first_frost_month=9
        )

        db.session.add_all([tropical, subtropical, temperate, mediterranean, arid, alpine])
        db.session.commit()

        # ── Plants ───────────────────────────────────────────────
        plants_data = [
            Plant(
                name="Tomato", scientific_name="Solanum lycopersicum", category="vegetable",
                description="One of the most popular garden vegetables. Thrives in warm climates with full sun. Produces juicy red fruits packed with vitamins.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=12,
                temp_min=10, temp_max=35, temp_optimal=24,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-draining loamy soil",
                difficulty="easy", emoji="🍅",
                soil_ph_min=6.0, soil_ph_max=6.8,
                is_indoor_capable=True,
                overwintering_temp=10,
                overwintering_tips="Move pots indoors before the first frost. Place near a south-facing window. Reduce watering and stop fertilizing. Can continue fruiting on a warm windowsill through winter.",
                propagation_method="Seed, Cutting",
                pruning_tips="Pinch out side shoots (suckers) in the leaf axils to keep energy focused on fruit. Remove lower leaves that touch the soil to prevent blight. Top the plant when it reaches the top of your support.",
                companions_json=J([
                    {"name": "Basil", "benefit": "Repels aphids, whitefly, and tomato hornworm. Many gardeners swear it improves tomato flavor."},
                    {"name": "Marigold", "benefit": "Exudes a scent that deters nematodes and whitefly. Plant as a border around tomatoes."},
                    {"name": "Carrot", "benefit": "Loosens soil around tomato roots, improving drainage and aeration."},
                    {"name": "Parsley", "benefit": "Attracts beneficial predatory insects that eat tomato pests."},
                ]),
                foes_json=J([
                    {"name": "Potato", "reason": "Both are in the Solanaceae family and share the same blight diseases (Phytophthora infestans). Growing them together spreads infection rapidly."},
                    {"name": "Fennel", "reason": "Fennel releases allelopathic chemicals from its roots that inhibit tomato growth and can cause early plant death."},
                    {"name": "Brassicas (Cabbage, Kale)", "reason": "Compete aggressively for nutrients and may stunt tomato development."},
                ]),
                pests_json=J([
                    {"name": "Tomato Hornworm", "description": "Large green caterpillar that defoliates plants quickly. Hand-pick or use Bt spray. Look for black droppings on leaves as an early sign."},
                    {"name": "Early Blight (Alternaria)", "description": "Dark concentric-ring spots on lower leaves. Remove affected leaves, avoid overhead watering, and rotate crops annually."},
                    {"name": "Whitefly", "description": "Tiny white insects under leaves that weaken plants. Use yellow sticky traps and neem oil spray."},
                    {"name": "Blossom End Rot", "description": "Not a pest but a calcium deficiency caused by irregular watering. Maintain consistent moisture and mulch well."},
                ]),
                sow_indoors_start=2, sow_indoors_end=3,
                transplant_start=5, transplant_end=5,
                harvest_start=7, harvest_end=9,
                regions=[temperate, subtropical]
            ),
            Plant(
                name="Mango", scientific_name="Mangifera indica", category="fruit",
                description="King of fruits. A tropical tree that produces sweet aromatic fruits. Requires a dry season to trigger flowering.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=520,
                temp_min=21, temp_max=43, temp_optimal=30,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Deep well-drained loamy soil",
                difficulty="medium", emoji="🥭",
                soil_ph_min=5.5, soil_ph_max=7.5,
                is_indoor_capable=True,
                overwintering_temp=10,
                overwintering_tips="Dwarf varieties can be grown in large containers. Bring indoors when temperatures drop below 10°C. Place in the sunniest spot available. Water sparingly in winter and keep humidity high with a pebble tray.",
                propagation_method="Seed, Grafting",
                pruning_tips="Prune after harvest to shape the canopy and improve airflow. Remove crossing, dead, or diseased branches. Young trees benefit from tip-pruning to encourage bushy growth. Avoid heavy pruning — mango fruits on the tips of new growth.",
                companions_json=J([
                    {"name": "Neem Tree", "benefit": "Natural pest repellent that reduces mango hopper populations when planted nearby."},
                    {"name": "Lemongrass", "benefit": "Repels insects and makes a good ground cover around mango trunks."},
                    {"name": "Moringa", "benefit": "Fast-growing windbreak that also adds nitrogen to the soil."},
                ]),
                foes_json=J([
                    {"name": "Other Fruiting Trees (close proximity)", "reason": "Mangoes need ample space (8–10m) to develop their canopy. Crowded trees compete for light and nutrients, reducing yield."},
                    {"name": "Avocado", "reason": "Both have aggressive root systems; planting too close leads to competition and potential disease transmission."},
                ]),
                pests_json=J([
                    {"name": "Mango Hopper (Idioscopus)", "description": "Sucks sap from flower panicles, causing flowers to drop before setting fruit. Spray neem oil or kaolin clay during flowering."},
                    {"name": "Anthracnose (Colletotrichum)", "description": "Black spots on fruit and flowers. A major post-harvest disease. Use copper-based fungicides before rains."},
                    {"name": "Mango Scale (Aulacaspis)", "description": "White crusty scales on trunk and branches. Treat with horticultural oil spray in dry season."},
                ]),
                sow_indoors_start=1, sow_indoors_end=4,
                transplant_start=None, transplant_end=None,
                harvest_start=5, harvest_end=8,
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Wheat", scientific_name="Triticum aestivum", category="grain",
                description="A staple cereal crop grown worldwide. Cool-season crop that tolerates frost during vegetative stage.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=16, fruit_bearing_weeks_max=24,
                temp_min=3, temp_max=32, temp_optimal=15,
                sunlight="Full Sun", water_needs="Low", soil_type="Clay loam to loamy soil",
                difficulty="medium", emoji="🌾",
                soil_ph_min=6.0, soil_ph_max=7.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Winter wheat is sown in autumn and naturally overwinters in the ground. It can tolerate temperatures down to -20°C when snow-covered. No special protection needed.",
                propagation_method="Seed (direct sow)",
                pruning_tips="Wheat does not require pruning. Thin seedlings to 8–10cm spacing if sown densely. Avoid disturbing roots after establishment.",
                companions_json=J([
                    {"name": "Clover", "benefit": "Fixes atmospheric nitrogen, reducing fertilizer needs. Acts as living mulch between rows."},
                    {"name": "Vetch", "benefit": "Another nitrogen-fixer; improves soil fertility and suppresses weeds when used as a cover crop before wheat."},
                    {"name": "Legumes (Peas, Beans)", "benefit": "Rotate with wheat to replenish nitrogen depleted by the cereal crop."},
                ]),
                foes_json=J([
                    {"name": "Wild Rye (Secale cereale)", "reason": "Produces allelopathic compounds that suppress wheat germination and growth if allowed to persist in the field."},
                    {"name": "Brome Grass", "reason": "A highly competitive weed that is very difficult to remove from wheat crops and reduces yields significantly."},
                ]),
                pests_json=J([
                    {"name": "Hessian Fly", "description": "Larvae feed at the stem base, weakening plants so they lodge (fall over). Plant resistant varieties and delay sowing."},
                    {"name": "Wheat Rust (Puccinia)", "description": "Orange/yellow pustules on leaves and stems. Use resistant cultivars and fungicide if severe."},
                    {"name": "Aphids (Grain Aphid)", "description": "Transmit Barley Yellow Dwarf Virus. Monitor and apply insecticide if populations are high before heading."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=None, transplant_end=None,
                harvest_start=6, harvest_end=7,
                regions=[temperate, alpine]
            ),
            Plant(
                name="Rice", scientific_name="Oryza sativa", category="grain",
                description="The world's most important food crop. Requires flooded paddies for best yields. Demands high heat and humidity.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=14, fruit_bearing_weeks_max=20,
                temp_min=20, temp_max=40, temp_optimal=30,
                sunlight="Full Sun", water_needs="High", soil_type="Clayey waterlogged soil",
                difficulty="hard", emoji="🍚",
                soil_ph_min=5.5, soil_ph_max=7.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Rice is a warm-season annual and is not suitable for overwintering. It must be grown each season from seed. In subtropical regions a second crop can be grown between August and January.",
                propagation_method="Seed (transplanted seedling)",
                pruning_tips="Rice does not require pruning. Thinning transplanted seedlings to 2–3 per hill improves yield. Drain the paddy 2 weeks before harvest to allow the soil to firm up for harvest machinery or hand-cutting.",
                companions_json=J([
                    {"name": "Azolla (Water Fern)", "benefit": "Floats on paddy water and fixes nitrogen, reducing fertilizer needs by up to 30%."},
                    {"name": "Sesbania (Dhaincha)", "benefit": "Green manure crop grown before rice transplanting; ploughed in to add nitrogen."},
                    {"name": "Ducks (in rice-duck farming)", "benefit": "Ducks eat weeds and pests while fertilizing the paddy with their droppings."},
                ]),
                foes_json=J([
                    {"name": "Barnyard Grass (Echinochloa)", "reason": "The most damaging weed in rice paddies. Competes fiercely for nutrients and is very difficult to distinguish from rice seedlings."},
                    {"name": "Water Hyacinth", "reason": "Invasive floating weed that chokes paddies, depletes oxygen, and massively reduces rice yields."},
                ]),
                pests_json=J([
                    {"name": "Brown Planthopper (BPH)", "description": "Sucks phloem sap, causing 'hopperburn' — plants turn brown and die in patches. Use BPH-resistant varieties."},
                    {"name": "Rice Blast (Magnaporthe oryzae)", "description": "Diamond-shaped lesions on leaves and neck; can destroy entire crop. Plant resistant varieties and avoid excess nitrogen."},
                    {"name": "Stem Borer (Scirpophaga)", "description": "Larvae bore into stems causing 'dead heart' in vegetative stage or 'white ear' at heading. Use pheromone traps and biological controls."},
                ]),
                sow_indoors_start=4, sow_indoors_end=5,
                transplant_start=5, transplant_end=6,
                harvest_start=9, harvest_end=10,
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Apple", scientific_name="Malus domestica", category="fruit",
                description="A beloved temperate-zone fruit tree that needs cold winters (chilling hours) to break dormancy and produce fruit.",
                germination_weeks_min=10, germination_weeks_max=16,
                fruit_bearing_weeks_min=200, fruit_bearing_weeks_max=400,
                temp_min=-15, temp_max=35, temp_optimal=18,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained loamy soil",
                difficulty="medium", emoji="🍎",
                soil_ph_min=6.0, soil_ph_max=7.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Apple trees are frost-hardy and need cold winters (700–1200 chilling hours below 7°C) to fruit properly. Do not protect from frost. Apply mulch over roots in severe winters. Prune in late winter while fully dormant.",
                propagation_method="Grafting, Budding",
                pruning_tips="Prune in late winter (February–March) while the tree is dormant. Remove crossing, crowded, and inward-facing branches to open the canopy to light. Aim for a goblet shape. Summer-prune water shoots to redirect energy to fruit development.",
                companions_json=J([
                    {"name": "Chives", "benefit": "Said to prevent apple scab and repel aphids. Plant around the base of the tree."},
                    {"name": "Nasturtium", "benefit": "Acts as a trap crop for aphids, drawing them away from the apple tree."},
                    {"name": "Lavender", "benefit": "Attracts pollinators (bees) essential for apple fruit set, and repels codling moth."},
                    {"name": "Comfrey", "benefit": "Deep roots mine nutrients and the leaves make excellent mulch around the tree base."},
                ]),
                foes_json=J([
                    {"name": "Grass (under canopy)", "reason": "Grass competes intensely with apple roots for nitrogen and water, reducing growth and yields. Keep a clear mulched circle of 1m around each tree."},
                    {"name": "Potato", "reason": "Potatoes can harbour Phytophthora root rot that can spread to apple tree roots."},
                    {"name": "Walnut", "reason": "Walnut roots produce juglone, a toxic compound that stunts or kills apple trees planted within the drip zone."},
                ]),
                pests_json=J([
                    {"name": "Codling Moth (Cydia pomonella)", "description": "Larvae tunnel into fruit creating the classic 'wormy apple'. Use pheromone traps, kaolin clay, and codling moth granulosis virus spray."},
                    {"name": "Apple Scab (Venturia inaequalis)", "description": "Olive-brown velvety patches on leaves and fruit. Rake and destroy fallen leaves in autumn to break the cycle."},
                    {"name": "Woolly Apple Aphid", "description": "White woolly colonies on branches and roots. Introduces galls. Natural predators (hoverflies, parasitic wasps) help control."},
                    {"name": "Fireblight (Erwinia amylovora)", "description": "Bacterial disease causing shoots to look burnt. Prune out infected wood well below the damage and sterilise tools between cuts."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=10, transplant_end=11,
                harvest_start=8, harvest_end=10,
                regions=[temperate]
            ),
            Plant(
                name="Banana", scientific_name="Musa acuminata", category="fruit",
                description="A fast-growing tropical plant that produces clusters of nutritious fruits. Loves heat, humidity, and rich soil.",
                germination_weeks_min=3, germination_weeks_max=6,
                fruit_bearing_weeks_min=36, fruit_bearing_weeks_max=52,
                temp_min=18, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="High", soil_type="Rich loamy well-drained soil",
                difficulty="easy", emoji="🍌",
                soil_ph_min=5.5, soil_ph_max=7.0,
                is_indoor_capable=True,
                overwintering_temp=10,
                overwintering_tips="In temperate climates, cut the pseudostem back to 1m before the first frost. Cover the cut with a plastic bag tied firmly. Heavily mulch the base. Alternatively, dig up the corm and store in a frost-free shed. Dwarf varieties can be kept in large containers indoors over winter.",
                propagation_method="Sucker (pup) division, Corm division",
                pruning_tips="Remove all but one or two 'pup' suckers per plant to concentrate energy on the main stem. After the bunch is harvested, cut the mother plant down to the ground — it will not fruit again. A healthy pup will grow in its place for the next season's crop.",
                companions_json=J([
                    {"name": "Lemongrass", "benefit": "Repels insects and rabbits. Thrives in the same humid, warm conditions as banana."},
                    {"name": "Ginger / Turmeric", "benefit": "Excellent shade-tolerant ground cover under bananas; both prefer similar rich, moist soil."},
                    {"name": "Comfrey", "benefit": "Provides potassium-rich mulch when cut and dropped around the base."},
                ]),
                foes_json=J([
                    {"name": "Other Banana Plants (too close)", "reason": "Dense plantings promote rapid spread of Fusarium wilt (Panama disease). Maintain at least 3–4m between plants."},
                    {"name": "Corn / Maize", "reason": "Competes for the same nutrients (especially potassium) and can harbour pests that affect bananas."},
                ]),
                pests_json=J([
                    {"name": "Panama Disease (Fusarium wilt)", "description": "Devastating soil-borne fungus causing yellowing and plant collapse. No cure; use resistant Cavendish or GCTCV varieties. Avoid moving contaminated soil."},
                    {"name": "Banana Weevil (Cosmopolites sordidus)", "description": "Larvae tunnel into the corm, weakening the plant. Use pheromone-baited traps and clean planting material."},
                    {"name": "Black Sigatoka (Pseudocercospora fijiensis)", "description": "Black streaks on leaves that merge into large dead areas, reducing photosynthesis. Apply copper fungicides and remove infected leaves promptly."},
                ]),
                sow_indoors_start=3, sow_indoors_end=5,
                transplant_start=5, transplant_end=6,
                harvest_start=1, harvest_end=12,
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Cactus (Saguaro)", scientific_name="Carnegiea gigantea", category="succulent",
                description="An iconic desert plant that stores water in its trunk. Extremely drought-tolerant and slow-growing.",
                germination_weeks_min=2, germination_weeks_max=8,
                fruit_bearing_weeks_min=2080, fruit_bearing_weeks_max=3120,
                temp_min=-9, temp_max=50, temp_optimal=32,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy or gravelly well-drained soil",
                difficulty="easy", emoji="🌵",
                soil_ph_min=6.0, soil_ph_max=7.5,
                is_indoor_capable=True,
                overwintering_temp=None,
                overwintering_tips="Saguaro is hardy to brief frosts (-9°C) but young seedlings need frost protection for the first 5 years. Grow in terracotta pots with sandy mix — bring indoors before prolonged freezes. Cacti in pots are excellent year-round houseplants in a sunny south window.",
                propagation_method="Seed",
                pruning_tips="Cacti do not require pruning. Remove dead or diseased tissue with a sterilised sharp knife, dusting the wound with sulphur powder to prevent infection. Never remove healthy arms — this is illegal in protected areas in the USA.",
                companions_json=J([
                    {"name": "Desert Wildflowers (Poppies, Lupine)", "benefit": "Attract native pollinators that the Saguaro depends on for pollination and fruit set."},
                    {"name": "Agave", "benefit": "Tolerates the same extreme drought and heat; makes a dramatic, low-maintenance companion."},
                    {"name": "Palo Verde Tree", "benefit": "Acts as a 'nurse plant' for juvenile Saguaros, shading and protecting young seedlings in their first years."},
                ]),
                foes_json=J([
                    {"name": "Plants requiring frequent watering", "reason": "Overwatered soil near a cactus causes root rot. Keep high-water plants well away."},
                    {"name": "Grass lawns", "reason": "Lawn irrigation creates waterlogged conditions fatal to cacti."},
                ]),
                pests_json=J([
                    {"name": "Cactus Longhorn Beetle", "description": "Larvae bore into the trunk, creating tunnels that become infected. Treat entry holes with insecticide."},
                    {"name": "Bacterial Necrosis", "description": "Brown, mushy, foul-smelling rot inside the trunk after wounding. Remove affected tissue and allow to dry."},
                    {"name": "Cochineal Scale", "description": "White cottony masses on pads/skin. These are insects producing carmine dye. Blast off with water or treat with insecticidal soap."},
                ]),
                sow_indoors_start=4, sow_indoors_end=6,
                transplant_start=None, transplant_end=None,
                harvest_start=6, harvest_end=7,
                regions=[arid]
            ),
            Plant(
                name="Potato", scientific_name="Solanum tuberosum", category="vegetable",
                description="A cool-season root crop and global food staple. Grows best in loose, well-drained soil with cool temperatures.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=10, fruit_bearing_weeks_max=16,
                temp_min=7, temp_max=25, temp_optimal=16,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Loose sandy loam soil",
                difficulty="easy", emoji="🥔",
                soil_ph_min=4.8, soil_ph_max=6.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Potatoes are not suitable for overwintering in the ground in cold climates. Harvest all tubers before the ground freezes and store in a cool (4–7°C), dark, humid environment. Properly stored potatoes keep for 4–6 months.",
                propagation_method="Tuber (seed potato) division",
                pruning_tips="'Earth up' the stems by mounding soil around the plant as it grows — this prevents tubers turning green (toxic) and encourages more tubers to form. Remove any flowers that appear to direct energy to tuber production. No other pruning is needed.",
                companions_json=J([
                    {"name": "Horseradish", "benefit": "Repels Colorado potato beetle; plant in the corners of the potato bed."},
                    {"name": "Marigold", "benefit": "Deters nematodes and whitefly. Strong scent confuses pests."},
                    {"name": "Beans", "benefit": "Fix nitrogen and improve soil fertility. Good companion in rotation."},
                    {"name": "Nasturtium", "benefit": "Trap crop for aphids. Attracts beneficial predatory insects."},
                ]),
                foes_json=J([
                    {"name": "Tomato", "reason": "Both are Solanaceae and share the devastating late blight pathogen. Never grow them adjacent — blight spreads rapidly between the two."},
                    {"name": "Cucumber", "reason": "Both crops are heavy feeders competing for similar nutrients, leading to reduced yields for both."},
                    {"name": "Sunflower", "reason": "Sunflowers are allelopathic to potatoes and may stunt their growth."},
                    {"name": "Raspberry", "reason": "Raspberries can carry common potato viruses, so keep them separated."},
                ]),
                pests_json=J([
                    {"name": "Colorado Potato Beetle", "description": "Yellow-striped beetle whose larvae devastate foliage. Hand-pick egg masses and larvae. Use Bt (Bacillus thuringiensis) or spinosad spray."},
                    {"name": "Late Blight (Phytophthora infestans)", "description": "The pathogen that caused the Irish Famine. Dark, water-soaked lesions on leaves; spreads in wet, humid weather. Destroy infected plants immediately; do not compost."},
                    {"name": "Common Scab (Streptomyces scabies)", "description": "Rough, corky patches on tuber skin. Avoid high soil pH (keep below 6.0) and use resistant varieties."},
                    {"name": "Wireworm", "description": "Soil larvae that tunnel into tubers. Rotate crops and avoid planting after grass."},
                ]),
                sow_indoors_start=2, sow_indoors_end=3,
                transplant_start=4, transplant_end=5,
                harvest_start=7, harvest_end=9,
                regions=[temperate, alpine]
            ),
            Plant(
                name="Lavender", scientific_name="Lavandula angustifolia", category="herb",
                description="A fragrant Mediterranean herb used in perfumes and cooking. Thrives in dry, sunny conditions with poor soil.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=20,
                temp_min=-15, temp_max=35, temp_optimal=20,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy well-drained alkaline soil",
                difficulty="easy", emoji="💜",
                soil_ph_min=6.5, soil_ph_max=7.5,
                is_indoor_capable=True,
                overwintering_temp=None,
                overwintering_tips="English lavender (L. angustifolia) is very frost-hardy to -15°C. Avoid winter mulching with organic matter, which holds moisture and causes root rot. French and Spanish lavenders are less hardy and should be potted and brought indoors. Trim lightly in autumn but do the main cut in spring.",
                propagation_method="Cutting, Seed",
                pruning_tips="Cut back by one-third immediately after flowering to maintain a compact, bushy shape. Never cut into old, woody stems as these rarely re-sprout. In spring, cut back to where you see fresh green growth emerging. Replace plants every 5–7 years when they become very woody.",
                companions_json=J([
                    {"name": "Roses", "benefit": "Lavender repels aphids and attracts bees for pollination. Classic cottage garden combination."},
                    {"name": "Thyme", "benefit": "Both thrive in identical well-drained, alkaline, dry conditions. Thyme also repels pests."},
                    {"name": "Sage", "benefit": "Companion herbs with identical growing requirements; both repel cabbage moth."},
                    {"name": "Apple / Fruit trees", "benefit": "Lavender planted below fruit trees attracts pollinators at flowering time."},
                ]),
                foes_json=J([
                    {"name": "Mint", "reason": "Mint is invasive and spreads aggressively. It prefers moist soil and will outcompete lavender in ideal lavender conditions."},
                    {"name": "Hostas", "reason": "Hostas prefer shade and moist soil — the opposite of what lavender needs."},
                    {"name": "Impatiens", "reason": "High-water plants that create conditions (wet soil) lethal to lavender."},
                ]),
                pests_json=J([
                    {"name": "Lavender Shab (Phoma lavandulae)", "description": "Woody, dying stems with grey discolouration at the base. Caused by poor airflow and damp. Prune out affected stems and improve drainage."},
                    {"name": "Rosemary Beetle", "description": "Metallic green/purple beetle and larvae that eat foliage. Hand-pick adults and larvae. Spray with pyrethrum if severe."},
                    {"name": "Root Rot (Phytophthora)", "description": "Caused by waterlogged soil. Plant in raised beds or add grit to improve drainage. Prevention is the only cure."},
                ]),
                sow_indoors_start=2, sow_indoors_end=4,
                transplant_start=5, transplant_end=5,
                harvest_start=6, harvest_end=8,
                regions=[mediterranean, temperate]
            ),
            Plant(
                name="Olive", scientific_name="Olea europaea", category="fruit",
                description="An ancient Mediterranean tree known for its oil-rich fruits. Extremely drought-tolerant once established.",
                germination_weeks_min=8, germination_weeks_max=12,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=520,
                temp_min=-10, temp_max=40, temp_optimal=22,
                sunlight="Full Sun", water_needs="Low", soil_type="Well-drained calcareous loamy soil",
                difficulty="medium", emoji="🫒",
                soil_ph_min=5.5, soil_ph_max=8.5,
                is_indoor_capable=True,
                overwintering_temp=-5,
                overwintering_tips="Established olive trees tolerate brief periods to -10°C but prefer winters above -5°C. In colder climates, grow in large terracotta pots and move into a cool but frost-free greenhouse or garage (2–7°C) for winter. Allow the tree to go semi-dormant with minimal watering. Never bring into a warm, heated room.",
                propagation_method="Semi-hardwood Cutting, Grafting",
                pruning_tips="Prune in late spring after any frost risk has passed. Remove suckers from the base and watersprouts from the main branches. Thin the canopy to allow light penetration — olives fruit on the previous year's growth, so avoid removing too much fruiting wood. Keep the centre open (vase shape). Olives can tolerate hard renovation pruning.",
                companions_json=J([
                    {"name": "Lavender", "benefit": "Thrives in identical dry, alkaline conditions. Attracts pollinators and repels the olive fly."},
                    {"name": "Rosemary", "benefit": "Perfect drought-tolerant companion that also deters pests."},
                    {"name": "Thyme", "benefit": "Ground cover that suppresses weeds without competing aggressively with olive roots."},
                ]),
                foes_json=J([
                    {"name": "High-water-requirement plants", "reason": "Regular irrigation suited to vegetables or bedding plants creates waterlogged conditions that cause olive root rot."},
                    {"name": "Walnut", "reason": "Walnut produces juglone, which is toxic to many plants including olives."},
                ]),
                pests_json=J([
                    {"name": "Olive Fruit Fly (Bactrocera oleae)", "description": "Larvae feed inside the olive fruit, causing drop and making oil rancid. Use protein bait traps and Spinosad spray."},
                    {"name": "Olive Knot (Pseudomonas savastanoi)", "description": "Rough, rounded galls on branches caused by bacteria entering through pruning wounds. Prune in dry weather and sterilise tools."},
                    {"name": "Peacock Spot (Cycloconium oleaginum)", "description": "Circular dark spots with yellow halos on leaves; major leaf drop in wet winters. Copper fungicide spray in autumn is effective."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=3, transplant_end=4,
                harvest_start=10, harvest_end=12,
                regions=[mediterranean, arid]
            ),
            Plant(
                name="Coconut", scientific_name="Cocos nucifera", category="fruit",
                description="The 'tree of life' in tropical cultures. Provides food, water, oil, and fiber. Needs year-round warmth.",
                germination_weeks_min=12, germination_weeks_max=24,
                fruit_bearing_weeks_min=300, fruit_bearing_weeks_max=400,
                temp_min=20, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="High", soil_type="Sandy coastal soil",
                difficulty="medium", emoji="🥥",
                soil_ph_min=5.0, soil_ph_max=8.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Coconut palms require year-round warmth (minimum 20°C) and cannot be overwintered successfully in cold climates. They can be grown as ornamental specimens in large pots in very sunny conservatories but will rarely fruit outside the tropics.",
                propagation_method="Seed (whole nut)",
                pruning_tips="Remove only dead or dying fronds, cutting cleanly at the base of the frond near the trunk. Do not cut green fronds — each frond is a future growth point and removing healthy ones weakens the tree. Never 'hurricane cut' (removing all but a few fronds) as this severely stresses the palm.",
                companions_json=J([
                    {"name": "Banana", "benefit": "Thrives in the same tropical conditions; bananas act as windbreak for young coconut palms."},
                    {"name": "Pineapple", "benefit": "Low-growing, tolerates the dappled shade under coconut canopy and suppresses weeds."},
                    {"name": "Cacao", "benefit": "Another tropical companion that benefits from the filtered shade of coconut fronds."},
                ]),
                foes_json=J([
                    {"name": "Areca/Betel Palm", "reason": "Competes for the same nutrients and water; also shares several diseases including lethal yellowing."},
                    {"name": "Other coconut palms (too close)", "reason": "Coconuts need 8–9m spacing; overcrowding reduces yields and creates conditions for pest and disease buildup."},
                ]),
                pests_json=J([
                    {"name": "Lethal Yellowing (Phytoplasma)", "description": "Fatal disease causing premature fruit drop and frond yellowing. No cure. Use resistant 'Malayan Dwarf' varieties. Spread by the Myndus crudus planthopper."},
                    {"name": "Rhinoceros Beetle (Oryctes rhinoceros)", "description": "Adults bore into the crown, damaging growing tissue. Trap using pheromone lures; apply baculovirus biocontrol."},
                    {"name": "Red Palm Weevil (Rhynchophorus ferrugineus)", "description": "Most destructive palm pest worldwide. Larvae feed inside the trunk, killing it. Trap with pheromone traps; treat early infestations with insecticide injection."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=None, transplant_end=None,
                harvest_start=1, harvest_end=12,
                regions=[tropical]
            ),
            Plant(
                name="Strawberry", scientific_name="Fragaria × ananassa", category="fruit",
                description="A popular low-growing fruit plant. Produces sweet red berries. Needs cold winters for dormancy.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=16,
                temp_min=1, temp_max=30, temp_optimal=20,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained sandy loam soil",
                difficulty="easy", emoji="🍓",
                soil_ph_min=5.5, soil_ph_max=6.5,
                is_indoor_capable=True,
                overwintering_temp=None,
                overwintering_tips="Strawberry plants are frost-hardy to -15°C if covered with a thick straw mulch. This mulch also gives the plant its name! Apply straw after the first hard frost. Potted plants can be moved into an unheated greenhouse. Remove the mulch in early spring before growth resumes.",
                propagation_method="Runner (stolon) rooting, Seed",
                pruning_tips="After harvesting, cut all foliage back to 10cm ('renovation') to rejuvenate plants and remove pests/diseases. Pot up strong runners to make new plants. Remove all runners on first-year plants to encourage fruit development. Replace old plants every 3–4 years.",
                companions_json=J([
                    {"name": "Borage", "benefit": "Deters tomato hornworm and aphids. Attracts pollinators. Many gardeners claim borage improves strawberry flavor."},
                    {"name": "Spinach / Lettuce", "benefit": "Low-growing crops that make good ground cover between strawberry rows, suppressing weeds."},
                    {"name": "Thyme", "benefit": "Repels worms and provides aromatic ground cover between plants."},
                    {"name": "Marigold", "benefit": "Deters nematodes that damage strawberry roots."},
                ]),
                foes_json=J([
                    {"name": "Fennel", "reason": "Allelopathic to most plants including strawberries; inhibits fruit production."},
                    {"name": "Brassicas", "reason": "Heavy nitrogen feeders that leave soil conditions unfavorable for strawberry development."},
                    {"name": "Tomato / Potato / Eggplant", "reason": "Share Verticillium wilt, which persists in soil and devastates strawberry crops. Never follow strawberries after these crops."},
                ]),
                pests_json=J([
                    {"name": "Strawberry Grey Mould (Botrytis cinerea)", "description": "Fluffy grey mould on ripening fruit in wet weather. The most common strawberry disease. Improve airflow, mulch, and pick fruit promptly."},
                    {"name": "Vine Weevil (Otiorhynchus sulcatus)", "description": "C-shaped white larvae eat strawberry roots, causing wilting and plant death. Use biological nematode drench in late summer."},
                    {"name": "Strawberry Eelworm (Ditylenchus dipsaci)", "description": "Microscopic nematodes causing stunted, distorted leaves. No cure — destroy affected plants, rest the bed for 4 years."},
                ]),
                sow_indoors_start=2, sow_indoors_end=3,
                transplant_start=4, transplant_end=5,
                harvest_start=6, harvest_end=8,
                regions=[temperate, alpine]
            ),
            Plant(
                name="Chili Pepper", scientific_name="Capsicum annuum", category="vegetable",
                description="A spicy crop grown worldwide. Requires warm temperatures to develop heat compounds (capsaicin).",
                germination_weeks_min=2, germination_weeks_max=3,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=14,
                temp_min=15, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Rich well-drained loamy soil",
                difficulty="easy", emoji="🌶️",
                soil_ph_min=6.0, soil_ph_max=6.8,
                is_indoor_capable=True,
                overwintering_temp=7,
                overwintering_tips="Chilli plants are perennials that can be overwintered to give a huge head start the following season. Before the first frost, cut back by half and bring inside into a cool room (7–12°C). Water very sparingly — just enough to stop the soil drying out completely. Resume watering in February and move to a warm, sunny spot.",
                propagation_method="Seed, Cutting",
                pruning_tips="Pinch off the first flowers to encourage a bushy plant with more flowers later. Remove the growing tip above the first fork to promote branching. Overwintered plants should be cut back by half to two-thirds in late winter to promote new productive growth.",
                companions_json=J([
                    {"name": "Basil", "benefit": "Repels aphids and thrips. Enhances the growth of chilli peppers when planted nearby."},
                    {"name": "Tomato", "benefit": "Shares space and growing conditions well; both benefit from staking and mulching."},
                    {"name": "Carrot", "benefit": "Loosens compacted soil around chilli roots and deters some soil pests."},
                    {"name": "Marigold", "benefit": "Deters nematodes and whitefly which are significant chilli pests."},
                ]),
                foes_json=J([
                    {"name": "Fennel", "reason": "Releases allelopathic chemicals that inhibit most garden plants including chilli peppers."},
                    {"name": "Apricot / Stone Fruits", "reason": "Apricots harbour Verticillium wilt which spreads to Capsicum plants."},
                ]),
                pests_json=J([
                    {"name": "Capsicum Aphid (Myzus persicae)", "description": "Clusters of small green aphids under leaves, excreting honeydew that promotes sooty mould. Blast with water; use neem oil or introduce ladybirds."},
                    {"name": "Spider Mite (Tetranychus urticae)", "description": "Tiny mites causing stippled, yellowing leaves with fine webbing. Thrives in hot, dry conditions. Increase humidity and use predatory mites or neem."},
                    {"name": "Blossom Drop", "description": "Not a pest — caused by temperature extremes (above 35°C or below 15°C) during flowering, causing flowers to abort. Shade during heat waves."},
                ]),
                sow_indoors_start=2, sow_indoors_end=3,
                transplant_start=5, transplant_end=6,
                harvest_start=8, harvest_end=10,
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Blueberry", scientific_name="Vaccinium corymbosum", category="fruit",
                description="A nutritious cold-hardy berry shrub. Requires acidic soil and cold winters. Excellent antioxidant content.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=100, fruit_bearing_weeks_max=200,
                temp_min=-20, temp_max=30, temp_optimal=18,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Acidic well-drained sandy soil",
                difficulty="hard", emoji="🫐",
                soil_ph_min=4.0, soil_ph_max=5.5,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Blueberries need 800–1200 chilling hours below 7°C to fruit well — they are among the most frost-tolerant fruiting shrubs. Do not protect from frost. Mulch with pine bark or pine needles (which also acidify the soil). Protect flower buds from late spring frosts with fleece.",
                propagation_method="Softwood/Hardwood Cutting, Layering",
                pruning_tips="For the first 3 years, remove all flowers to let the plant establish. From year 4, prune in late winter/early spring: remove dead, damaged wood, and the oldest (darkest brown) canes. Keep 6–8 healthy young canes. The goal is to encourage new cane growth each year, as blueberries fruit best on 2–3 year-old wood.",
                companions_json=J([
                    {"name": "Azalea / Rhododendron", "benefit": "Ericaceous shrubs that thrive in the same acidic soil conditions."},
                    {"name": "Clover", "benefit": "Fixes nitrogen and creates mild, consistent moisture — plant as living mulch between blueberry rows."},
                    {"name": "Strawberry", "benefit": "Shares the preference for acidic soil and makes a productive ground cover companion."},
                ]),
                foes_json=J([
                    {"name": "Nightshades (Tomato, Pepper)", "reason": "These prefer neutral-alkaline soil; growing near blueberries will mean either the blueberries or the nightshades suffer."},
                    {"name": "Fennel", "reason": "Allelopathic to most fruiting plants including blueberry."},
                    {"name": "Brassicas", "reason": "Prefer alkaline soil and their presence (or their debris) can raise pH, harming blueberries."},
                ]),
                pests_json=J([
                    {"name": "Blueberry Maggot (Rhagoletis mendax)", "description": "Fly larvae develop inside fruit, causing premature drop and infestation. Use yellow sticky traps and pick up fallen fruit promptly."},
                    {"name": "Mummyberry (Monilinia vaccinii-corymbosi)", "description": "Fungal disease turning fruit into shrivelled, mummified 'berries'. Rake under bushes in autumn to remove mummified fruit."},
                    {"name": "Spotted Wing Drosophila (Drosophila suzukii)", "description": "Invasive fruit fly that lays eggs in ripening soft fruit. Use fine insect netting over bushes as fruit ripens."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=10, transplant_end=11,
                harvest_start=7, harvest_end=9,
                regions=[temperate, alpine]
            ),
            Plant(
                name="Sunflower", scientific_name="Helianthus annuus", category="flower",
                description="A tall, sun-loving flowering plant that produces edible seeds. Very adaptable and fast-growing.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=12,
                temp_min=7, temp_max=35, temp_optimal=22,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained loamy soil",
                difficulty="easy", emoji="🌻",
                soil_ph_min=6.0, soil_ph_max=7.5,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Sunflowers are tender annuals that cannot overwinter outdoors. Save seeds from the dried flowerhead in autumn and store in a cool, dry place for planting next spring. The dried heads can be left on the plant in winter as a food source for birds.",
                propagation_method="Seed (direct sow)",
                pruning_tips="For a single large head, grow as a single-stem plant with no side shoots. For multiple smaller heads (better for cut flowers and seed production), pinch out the growing tip when the plant is 30cm tall. Deadhead spent flowers on branching varieties to encourage more blooms. Do not deadhead if you want seeds for birds.",
                companions_json=J([
                    {"name": "Cucumber", "benefit": "Sunflowers provide shade for cucumber roots in hot weather. Cucumbers in turn act as living mulch."},
                    {"name": "Corn / Squash (Three Sisters+)", "benefit": "Can be added as a fourth sister — attracts pollinators and birds that eat corn pests."},
                    {"name": "Tomato", "benefit": "Attracts whiteflies away from tomatoes (trap crop). Also attracts aphid predators."},
                ]),
                foes_json=J([
                    {"name": "Potato", "reason": "Sunflowers are allelopathic to potatoes and inhibit their growth and yield."},
                    {"name": "Pole Beans", "reason": "Sunflowers can inhibit bean growth and may attract bean beetles."},
                ]),
                pests_json=J([
                    {"name": "Sunflower Moth (Homoeosoma electellum)", "description": "Larvae feed on pollen and developing seeds. Use row covers during bloom and Bt spray if severe."},
                    {"name": "Downy Mildew (Plasmopara halstedii)", "description": "White coating under leaves; stunting and distortion. Plant resistant varieties and rotate crops."},
                    {"name": "Birds (sparrows, finches)", "description": "Eat the seeds before harvest. Cover developing seed heads with netting or paper bags if you want to harvest seeds."},
                ]),
                sow_indoors_start=4, sow_indoors_end=5,
                transplant_start=5, transplant_end=6,
                harvest_start=8, harvest_end=9,
                regions=[temperate, subtropical, mediterranean]
            ),
            Plant(
                name="Basil", scientific_name="Ocimum basilicum", category="herb",
                description="A fragrant culinary herb used in Mediterranean and Asian cuisines. Sensitive to cold; thrives in heat.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=6, fruit_bearing_weeks_max=10,
                temp_min=10, temp_max=35, temp_optimal=25,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Moist well-drained rich soil",
                difficulty="easy", emoji="🌿",
                soil_ph_min=6.0, soil_ph_max=7.0,
                is_indoor_capable=True,
                overwintering_temp=10,
                overwintering_tips="Basil cannot survive frost and is grown as an annual in all but the hottest climates. Bring pots indoors before temperatures drop below 10°C. Place in the sunniest window available. Growth will slow but the plant survives for culinary use through winter. Take cuttings in late summer to ensure a fresh supply.",
                propagation_method="Seed, Stem Cutting in water",
                pruning_tips="Pinch out the growing tip above a leaf node as soon as the plant has 6 pairs of leaves. This prevents bolting and creates a bushy plant with more leaves. Repeat every 2–3 weeks. Remove any flower buds the moment they appear — once a basil plant flowers, the leaves lose flavor and the plant begins to die.",
                companions_json=J([
                    {"name": "Tomato", "benefit": "The classic pairing. Repels aphids, whitefly, and tomato hornworm. Many gardeners report improved tomato flavor when basil is grown nearby."},
                    {"name": "Pepper (Bell & Chilli)", "benefit": "Basil repels aphids and spider mites that afflict pepper plants."},
                    {"name": "Asparagus", "benefit": "Basil repels asparagus beetle."},
                    {"name": "Oregano", "benefit": "Companion herbs that thrive together and together repel pests."},
                ]),
                foes_json=J([
                    {"name": "Sage", "reason": "Sage and basil have conflicting growing requirements (basil needs more water) and may inhibit each other."},
                    {"name": "Rue", "reason": "Rue is allelopathic to basil — do not plant together."},
                    {"name": "Thyme", "reason": "Thyme prefers drier conditions than basil; the watering regimes conflict."},
                ]),
                pests_json=J([
                    {"name": "Fusarium Wilt (Fusarium oxysporum)", "description": "Soil-borne fungus causing sudden wilting and brown stem streaking. Common in commercial basil. No cure — remove plants; improve drainage; use resistant varieties."},
                    {"name": "Downy Mildew (Peronospora belbahrii)", "description": "Yellowing upper leaf surface with grey-purple fuzz below. Spreads rapidly in humid conditions. Improve airflow; water at the base only."},
                    {"name": "Aphids", "description": "Cluster on soft growing tips. Blast with water; introduce ladybirds. Basil's own companion effect (repelling aphids from neighbours) doesn't protect itself."},
                ]),
                sow_indoors_start=4, sow_indoors_end=5,
                transplant_start=6, transplant_end=6,
                harvest_start=6, harvest_end=9,
                regions=[tropical, subtropical, mediterranean]
            ),
            Plant(
                name="Pumpkin", scientific_name="Cucurbita pepo", category="vegetable",
                description="A warm-season vine crop producing large fruits. Needs ample space, sun, and consistent moisture.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=16,
                temp_min=10, temp_max=35, temp_optimal=25,
                sunlight="Full Sun", water_needs="High", soil_type="Rich fertile well-drained soil",
                difficulty="easy", emoji="🎃",
                soil_ph_min=6.0, soil_ph_max=6.8,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Pumpkins are tender annuals. The harvested fruit stores exceptionally well — cured pumpkins (skin hardened at 26°C for 10 days) keep for 3–6 months in a cool, dry location. Save seeds from open-pollinated varieties for next year's planting.",
                propagation_method="Seed (direct sow or transplant)",
                pruning_tips="Pinch off the growing tip after 2–3 fruits have set to redirect energy to ripening those fruits. Remove any male flowers after fruit has set to reduce plant energy spent on reproduction. In small gardens, train vines to spiral to keep them compact.",
                companions_json=J([
                    {"name": "Corn", "benefit": "Tall corn provides wind protection. Part of the traditional Three Sisters planting with beans and squash."},
                    {"name": "Beans", "benefit": "Fix nitrogen that feeds the hungry pumpkin vine."},
                    {"name": "Nasturtium", "benefit": "Acts as a trap crop for aphids and attracts pollinators for fruit set."},
                    {"name": "Marigold", "benefit": "Deters squash vine borer moths from laying eggs near pumpkin stems."},
                ]),
                foes_json=J([
                    {"name": "Potato", "reason": "Both are very heavy feeders; growing together depletes soil nutrition and reduces both crops' yields."},
                    {"name": "Brassicas", "reason": "Heavy feeders that compete vigorously; they also prefer cooler, moister soil."},
                ]),
                pests_json=J([
                    {"name": "Squash Vine Borer (Melitta curcurbitae)", "description": "Larvae bore into the base of stems, causing sudden wilting. Wrap stems in aluminium foil to deter egg-laying; inject Bt into infested stems."},
                    {"name": "Powdery Mildew (Podosphaera xanthii)", "description": "White powdery coating on leaves in late summer. Inevitable in humid conditions. Use resistant varieties and potassium bicarbonate spray."},
                    {"name": "Cucumber Beetle (Diabrotica)", "description": "Yellow and black striped or spotted beetles that eat leaves and transmit bacterial wilt. Use row covers early in the season; remove when flowers open for pollination."},
                ]),
                sow_indoors_start=4, sow_indoors_end=5,
                transplant_start=6, transplant_end=6,
                harvest_start=9, harvest_end=10,
                regions=[temperate, subtropical]
            ),
            Plant(
                name="Date Palm", scientific_name="Phoenix dactylifera", category="fruit",
                description="An ancient desert fruit tree adapted to extreme heat and drought. Produces sweet nutritious dates.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=364,
                temp_min=5, temp_max=50, temp_optimal=35,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy well-drained soil",
                difficulty="hard", emoji="🌴",
                soil_ph_min=6.0, soil_ph_max=8.0,
                is_indoor_capable=False,
                overwintering_temp=None,
                overwintering_tips="Date palms tolerate brief cold spells to 5°C but fruit ripening requires extremely hot, dry summers. In temperate climates they can be grown as ornamental palms but will rarely produce edible dates. Young palms can be grown in large containers and overwintered in a cool greenhouse. Ensure the palm never experiences wet cold.",
                propagation_method="Seed, Offshoot (pup) division",
                pruning_tips="Remove dead or dying fronds by cutting close to the trunk, leaving a short stub that will dry and fall away. Remove only fronds that hang below horizontal. Fruit bunches should be thinned at pollination time (leaving 1 bunch per frond) and bagged in paper or cloth to protect from birds and rain during ripening. Hand pollination is required for reliable fruit production.",
                companions_json=J([
                    {"name": "Barley (interplanted at base)", "benefit": "Traditional desert agriculture intercrop that can thrive in the date palm's shade."},
                    {"name": "Lucerne / Alfalfa", "benefit": "Deep-rooted nitrogen-fixer used between rows in date palm orchards."},
                    {"name": "Pomegranate", "benefit": "Equally drought-tolerant tree that pairs well in arid-climate orchards."},
                ]),
                foes_json=J([
                    {"name": "Other tall trees", "reason": "Date palms are the dominant species in their ecosystem. Other tall trees create shade that reduces yield and causes disease buildup."},
                    {"name": "High-water plants", "reason": "Irrigation required by most vegetables and fruits creates waterlogged conditions that promote bayoud disease in date palms."},
                ]),
                pests_json=J([
                    {"name": "Red Palm Weevil (Rhynchophorus ferrugineus)", "description": "The most destructive palm pest. Larvae eat the heart of the palm, killing it. Use pheromone bait traps and inject systemic insecticide if detected early."},
                    {"name": "Bayoud Disease (Fusarium oxysporum f.sp. albedinis)", "description": "Fatal fungal wilt disease unique to date palms. Spreads through soil and contaminated tools. No cure — plant resistant varieties (Mejhoul, Bou Sthammi)."},
                    {"name": "Dubas Bug (Ommatissus lybicus)", "description": "Planthopper nymphs and adults suck sap, excreting honeydew that fosters sooty mould. Apply neem extract or approved insecticide in spring."},
                ]),
                sow_indoors_start=3, sow_indoors_end=5,
                transplant_start=None, transplant_end=None,
                harvest_start=9, harvest_end=11,
                regions=[arid, subtropical]
            ),
            Plant(
                name="Kale", scientific_name="Brassica oleracea var. sabellica", category="vegetable",
                description="A cold-hardy superfood vegetable. Flavor actually improves after frost. Packed with vitamins and minerals.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=10,
                temp_min=-10, temp_max=25, temp_optimal=15,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Fertile well-drained moist soil",
                difficulty="easy", emoji="🥬",
                soil_ph_min=6.0, soil_ph_max=7.5,
                is_indoor_capable=True,
                overwintering_temp=None,
                overwintering_tips="Kale is one of the hardiest vegetables — it survives to -15°C and actually improves in flavor after frost (cold converts starches to sugars). Harvest outer leaves throughout winter. In alpine climates or severe freezes, protect with a cloche or cold frame. Can also be grown year-round as a houseplant in a sunny window.",
                propagation_method="Seed",
                pruning_tips="Harvest outer leaves regularly from the bottom up, leaving the central growing point intact. This keeps the plant productive for many months. In spring the plant will 'bolt' (send up a flower stalk) — remove the flowering stems to prolong harvesting, or let it flower to produce seeds for saving.",
                companions_json=J([
                    {"name": "Dill", "benefit": "Attracts hoverflies and parasitic wasps that prey on kale's main pest, the cabbage aphid."},
                    {"name": "Celery", "benefit": "Deters the cabbage white butterfly from laying eggs on kale leaves."},
                    {"name": "Marigold", "benefit": "Repels whitefly and attracts beneficial predators."},
                    {"name": "Beets", "benefit": "Good companion in raised beds — compatible nutrient requirements and root depths."},
                ]),
                foes_json=J([
                    {"name": "Strawberry", "reason": "Strawberries and brassicas are poor companions; they compete for soil nutrients and brassicas can harbour diseases affecting strawberry."},
                    {"name": "Tomato", "reason": "Both are heavy feeders; also, some research suggests kale inhibits tomato growth when planted very close."},
                    {"name": "Grape", "reason": "Traditional wisdom: grapes and brassicas do not grow well together. Possible allelopathic interaction."},
                ]),
                pests_json=J([
                    {"name": "Cabbage White Butterfly (Pieris brassicae)", "description": "Caterpillars devour leaves rapidly. Cover with fine netting, hand-pick eggs (clusters of yellow eggs) and caterpillars, or use Bt spray."},
                    {"name": "Cabbage Aphid (Brevicoryne brassicae)", "description": "Dense grey-green colonies under leaves and on growing tips, causing distortion. Blast with water; introduce ladybirds. Hardest pest to control in brassicas."},
                    {"name": "Club Root (Plasmodiophora brassicae)", "description": "Soil-borne pathogen causing grotesque swollen, distorted roots and plant wilting. No cure. Rest bed from brassicas for 7+ years; raise soil pH above 7.0 to suppress the pathogen."},
                ]),
                sow_indoors_start=3, sow_indoors_end=4,
                transplant_start=5, transplant_end=5,
                harvest_start=10, harvest_end=3,
                regions=[temperate, alpine]
            ),
            Plant(
                name="Lemon", scientific_name="Citrus limon", category="fruit",
                description="A popular citrus tree producing tart, vitamin C-rich fruits. Frost-sensitive but very adaptable to pots.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=200, fruit_bearing_weeks_max=300,
                temp_min=7, temp_max=38, temp_optimal=25,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained sandy loam",
                difficulty="medium", emoji="🍋",
                soil_ph_min=5.5, soil_ph_max=6.5,
                is_indoor_capable=True,
                overwintering_temp=7,
                overwintering_tips="Lemon trees are frost-tender and must come indoors when temperatures drop below 7°C. Place in the sunniest room available (ideally a cool conservatory at 10–15°C). Reduce watering significantly. Watch for spider mite and scale insect infestations which are common on indoor citrus. Move back outside after the last frost in spring, acclimatising gradually.",
                propagation_method="Semi-hardwood Cutting, Grafting",
                pruning_tips="Prune lemon trees in late spring (after the last frost) to shape the canopy. Remove crossing branches, water shoots (vigorous upright shoots), dead wood, and any shoots below the graft union. Tip-prune long new shoots after 4–6 leaves. Do not over-prune — lemons fruit on mature wood and removing too much reduces next year's crop.",
                companions_json=J([
                    {"name": "Lavender", "benefit": "Attracts pollinators and repels the citrus leafminer moth. Thrives in similar well-drained, sunny conditions."},
                    {"name": "Basil", "benefit": "Repels aphids and whitefly that commonly attack lemon trees."},
                    {"name": "Rosemary", "benefit": "Drought-tolerant companion with identical sunlight needs. Deters pests."},
                    {"name": "Marigold", "benefit": "Deters soil nematodes and whitefly. Traditional companion for citrus trees in Mediterranean orchards."},
                ]),
                foes_json=J([
                    {"name": "Grass lawn (beneath canopy)", "reason": "Grass competes heavily for nitrogen — the nutrient lemons need most. Keep a 1m grass-free, mulched circle under each tree."},
                    {"name": "Other citrus (too close)", "reason": "Citrus trees need at least 4–5m spacing for adequate light and airflow. Overcrowding promotes disease and reduces fruit size."},
                ]),
                pests_json=J([
                    {"name": "Citrus Leafminer (Phyllocnistis citrella)", "description": "Larvae mine silvery serpentine trails in soft new leaves, causing distortion. Apply kaolin clay spray on new growth flushes."},
                    {"name": "Citrus Scale (Coccidae / Diaspididae)", "description": "Brown or white waxy scales on stems and leaves. Treat with horticultural oil spray; introduce parasitic wasps as biological control."},
                    {"name": "Citrus Greening (Huanglongbing)", "description": "Bacterial disease spread by Asian citrus psyllid. Causes blotchy, asymmetric yellowing ('mottling') and bitter, green fruit that never ripens. No cure — remove and destroy infected trees immediately."},
                ]),
                sow_indoors_start=None, sow_indoors_end=None,
                transplant_start=3, transplant_end=4,
                harvest_start=11, harvest_end=3,
                regions=[subtropical, mediterranean]
            ),
        ]

        db.session.add_all(plants_data)
        db.session.commit()
        print(f"Seeded {len(plants_data)} plants and 6 regions successfully!")


if __name__ == '__main__':
    seed()
