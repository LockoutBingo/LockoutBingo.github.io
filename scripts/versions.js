export const VERSION_GROUPS = {
    "1.0": [
        "default"
    ],
    "2.0": [
        "obtain_chiseled_tuff",
        "obtain_tuff_brick_stairs",
        "obtain_copper_door",
        "obtain_copper_bulb",
        "obtain_crafter",
        "obtain_armadillo_scute",
        "obtain_wind_charge",
        "obtain_mace",
        "kill_bogged",
        "kill_breeze",
        "get_infested",
        "get_oozing",
        "get_raid_omen",
        "get_trial_omen",
        "get_weaving",
        "get_wind_charged",
        "locate_trial_chambers",
        "get_crafters_crafting_crafters_advancement",
        "get_blowback_advancement",
        "get_over-overkill_advancement",
        "equip_armor_on_a_wolf",
        "open_a_vault",
        "open_an_ominous_vault"
    ],
    "2.1": [
        "obtain_pumpkin",
        "obtain_all_soups",
        "obtain_inc_sac",
        "obtain_fermented_spider_eye",
        "get_cover_me_with_diamonds_advancement",
        "wear_a_dyed_leather_chestplate",
        "wear_pink_leather_boots",
        "place_dirt_on_bedrock",
        "place_end_stone_on_bedrock",
        "place_a_bed_on_bedrock",
        "use_a_map",
        "get_blindness_from_eating_suspicious_stew",
        "get_night_vision_from_eating_suspicious_stew",
        "get_a_spyglass_advancement"
    ],
    "3.0": [
        "obtain_chiseled_resin_bricks",
        "obtain_5_unique_wood",
        "obtain_bush",
        "obtain_all_chicken_eggs",
        "obtain_creaking_heart",
        "obtain_copper_bars",
        "obtain_copper_chain",
        "obtain_copper_chest",
        "obtain_shelf",
        "obtain_golden_dandelion",
        "obtain_all_nuggets",
        "obtain_bundle",
        "obtain_all_dyed_bundles",
        "obtain_harness",
        "obtain_dried_ghast",
        "obtain_nether_star",
        "obtain_beacon",
        "obtain_all_copper_tools",
        "obtain_every_type_of_spear",
        "obtain_nautilus_armor",
        "obtain_every_type_of_nautilus_armor",
        "breed_nautilus",
        "trade_with_a_villager",
        "attack_a_creaking",
        "ride_a_happy_ghast",
        "wear_copper_armor_set",
        "get_breath_of_the_nautilus",
        "drop_a_bucket_into_water",
        "summon_a_copper_golem",
        "put_a_bundle_in_a_bundle",
        "place_a_book_in_a_chiseled_bookshelf"
    ],
    "3.1": [
        "obtain_chiseled_cinnabar",
        "obtain_sulfur_brick_slab",
        "obtain_potent_sulfur",
        "obtain_bucket_of_sulfur_cube",
        "locate_a_sulfur_cave",
        "visit_more_biomes_than_opponent",
        "take_a_bath_in_a_sulfur_pool",
        "hit_a_block_absorbed_sulfur_cube",
        "give_soul_soil_to_a_sulfur_cube",
        "give_tnt_to_a_sulfur_cube",
        "put_out_a_campfire",
        "light_a_campfire",
        "light_a_candle",
        "set_leaves_on_fire"
    ]
}

export const VERSION_ADDED = {};

for(const [version, goals] of Object.entries(VERSION_GROUPS)) {
    for(const goal of goals) {
        VERSION_ADDED[goal] = version;
    }
}
