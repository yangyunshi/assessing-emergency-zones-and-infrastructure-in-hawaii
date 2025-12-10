//about page
//put data info here
"use client";

type Props = {
  open: boolean;
  onClose: () => void;
};

function AboutPage({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "600px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "30px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          color: "black"
        }}
        onClick={(e) => e.stopPropagation()} // prevents modal from closing when clicking inside
      >
        <h3 style={{
          marginTop: 0,
          marginBottom: "16px",
          fontSize: "1.1rem",
          fontWeight: 600
        }}>
          About the Visualization
        </h3>
        <p style={{marginBottom: "16px"}}>Assessing natural disaster hazard risks in Hawaii is a serious asset to public safety, whether it be from tsunami, fire, or storm occurrences, it’s better to be prepared and rather safe than sorry. Prioritizing public safety is always
          first when it comes to locals and, through proper knowledge, of the many different resources that we have available to us, turning that into a simplistic view for everyone to understand and follow is our primary goal.</p>

        <p style={{ marginBottom: "16px" }}>Our motivation for this project is pretty straightforward, we designed this visualization for the use of the public, to understand, infer, gather and act on the sources that are presented and given, should there be an unfortunate event
          that would befall any of the islands of Hawai’i. We gather many different sources of information; for example, areas of police and fire departments as well as high risk areas throughout the islands of Hawai’i (e.g., tsunami evacuation, high
          fire risk), are crucial and paramount to the safety of the peoples on the island. We comprise the data in an easy-to-use yet informative and aesthetically pleasing way to be informed and ready for when disaster strikes. As it is
          goal-centered around the general public and for use of people that are either curious of their local surroundings and want to prepare ahead of time, as well as new kama’aina that are planning to move to the islands of Hawai’i, to gain
          further insight on the Public Emergency Safety Buildings as well as reported risks in their area to grant them a general observation as to how and where action should be taken.</p>

        <p style={{ marginBottom: "16px" }}>The data we used in the visualization comes from different sources, including information from both government websites Open Data Hawaii (www.opendata.hawaii.gov), and the Hawaii Statewide GIS Program (www.geoportal.hawaii.gov). Of the
          information retrieved from both sites, we focused mainly on the areas of importance and high risk, of which data points include information about annual rainfall, emergency sirens, faults, fire risk locations, tsunami evacuation hazards and
          lava flow areas, as well as shelters and stations.</p>

        <p style={{ marginBottom: "16px" }}>This visualization was developed as part of a final group project for a Data Visualization course at the University of Hawaii at Manoa. Our group “Change Later” is composed of four aspiring undergraduate students; Justin Natividad, Allison Ebsen, Lloyd Sanderson, and Hailey Fagaragan, all of whose major work is collectively under Computer Science general track.</p>
        <div style={{display: "flex", justifyContent: "flex-end", marginTop: "20px"}}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: "#3ac2a0ff",
              border: "none",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;