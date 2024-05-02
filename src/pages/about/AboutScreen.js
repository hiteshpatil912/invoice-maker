import React from "react";
import PageTitle from "../../components/Common/PageTitle";

function AboutScreen() {
  return (
    <div>
      <div className="p-4">
        <div className="bg-white rounded-xl p-3 font-title">
          <PageTitle title="About Me" />
          {/* <div className="mt-4 mb-5 flex flex-row items-center">
            <img
              src="https://raw.githubusercontent.com/lwinmoepaing/lwinmoepaing/main/img/gitto.gif"
              className="h-12 mr-3"
              alt="Git"
            />
            <div>
              <a
                href="https://github.com/lwinmoepaing"
                target={"_blank"}
                className="underline cursor-pointer"
                rel="noreferrer"
              >
                Hi, I'm Lwin Moe Paing
              </a>
              <h1> your business.</h1>
            </div>
          </div> */}

          <PageTitle title="Contact" />
          <div className="mt-2 pl-1 text-sm">
            <a
              href="tel:+959420059241"
              className="underline cursor-pointer"
              target={"_blank"}
              rel="noreferrer"
            >
              {" "}
              +959420059241
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AboutScreen;
